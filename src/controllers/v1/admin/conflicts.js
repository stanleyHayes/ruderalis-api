const Conflict = require("./../../../models/v1/conflict");
const Order = require("./../../../models/v1/order");

exports.getConflicts = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) match['status'] = req.query.status;
        if (req.query.priority) match['priority'] = req.query.priority;
        if (req.query.reason) match['reason'] = req.query.reason;
        if (req.query.vendor) match['vendor'] = req.query.vendor;
        if (req.query.customer) match['customer'] = req.query.customer;
        if (req.query.assignedTo) match['assignedTo'] = req.query.assignedTo;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const conflicts = await Conflict.find(match)
            .skip(skip).limit(limit).sort({priority: -1, createdAt: -1})
            .populate({path: 'order', select: 'orderNumber status price'})
            .populate({path: 'customer', select: 'firstName lastName fullName email phone'})
            .populate({path: 'vendor', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop', select: 'name'})
            .populate({path: 'assignedTo', select: 'firstName lastName fullName'});
        const total = await Conflict.countDocuments(match);
        res.status(200).json({message: 'Conflicts retrieved', data: conflicts, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getConflict = async (req, res) => {
    try {
        const conflict = await Conflict.findById(req.params.id)
            .populate({path: 'order'})
            .populate({path: 'customer', select: 'firstName lastName fullName email phone address'})
            .populate({path: 'vendor', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop'})
            .populate({path: 'comments.user', select: 'firstName lastName fullName'})
            .populate({path: 'resolution.resolvedBy', select: 'firstName lastName fullName'})
            .populate({path: 'assignedTo', select: 'firstName lastName fullName'});
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found'});
        res.status(200).json({message: 'Conflict retrieved', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.assignConflict = async (req, res) => {
    try {
        const {adminId} = req.body;
        const conflict = await Conflict.findById(req.params.id);
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found'});
        conflict.assignedTo = adminId || req.admin._id;
        if (conflict.status === 'open') conflict.status = 'under_review';
        conflict.comments.push({user: req.admin._id, userModel: 'Admin', text: `Conflict assigned to admin for review.`});
        await conflict.save();
        res.status(200).json({message: 'Conflict assigned', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const allowed = ['open', 'under_review', 'awaiting_vendor', 'awaiting_customer', 'resolved', 'closed', 'escalated'];
        if (!allowed.includes(status))
            return res.status(400).json({message: 'Invalid status'});
        const conflict = await Conflict.findById(req.params.id);
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found'});
        conflict.status = status;
        conflict.comments.push({user: req.admin._id, userModel: 'Admin', text: `Status changed to ${status}.`});
        await conflict.save();
        res.status(200).json({message: `Conflict status updated to ${status}`, data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updatePriority = async (req, res) => {
    try {
        const {priority} = req.body;
        const allowed = ['low', 'medium', 'high', 'urgent'];
        if (!allowed.includes(priority))
            return res.status(400).json({message: 'Invalid priority'});
        const conflict = await Conflict.findById(req.params.id);
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found'});
        conflict.priority = priority;
        await conflict.save();
        res.status(200).json({message: `Priority updated to ${priority}`, data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.addComment = async (req, res) => {
    try {
        const {text} = req.body;
        if (!text)
            return res.status(400).json({message: 'Comment text is required'});
        const conflict = await Conflict.findById(req.params.id);
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found'});
        conflict.comments.push({user: req.admin._id, userModel: 'Admin', text});
        await conflict.save();
        res.status(200).json({message: 'Comment added', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.resolveConflict = async (req, res) => {
    try {
        const {type, description, amount, currency} = req.body;
        const allowedTypes = ['refund', 'replacement', 'partial_refund', 'store_credit', 'dismissed', 'other'];
        if (!type || !allowedTypes.includes(type))
            return res.status(400).json({message: 'Valid resolution type is required'});
        const conflict = await Conflict.findById(req.params.id);
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found'});
        if (conflict.status === 'resolved' || conflict.status === 'closed')
            return res.status(400).json({message: 'Conflict already resolved'});

        conflict.resolution = {
            type, description: description || '',
            amount: amount || 0, currency: currency || 'GHS',
            resolvedBy: req.admin._id, resolvedAt: new Date()
        };
        conflict.status = 'resolved';
        conflict.comments.push({
            user: req.admin._id, userModel: 'Admin',
            text: `Conflict resolved: ${type}${amount ? ` - ${currency || 'GHS'} ${amount}` : ''}. ${description || ''}`
        });

        // If refund, update order payment status
        if (type === 'refund' || type === 'partial_refund') {
            await Order.findByIdAndUpdate(conflict.order, {
                paymentStatus: type === 'refund' ? 'refunded' : 'paid',
                ...(type === 'refund' ? {status: 'refunded'} : {})
            });
        }

        await conflict.save();
        await conflict.populate([
            {path: 'resolution.resolvedBy', select: 'firstName lastName fullName'},
            {path: 'customer', select: 'firstName lastName fullName email'},
            {path: 'vendor', select: 'firstName lastName fullName email'}
        ]);
        res.status(200).json({message: 'Conflict resolved successfully', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
