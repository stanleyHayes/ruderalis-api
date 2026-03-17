const Conflict = require("./../../../models/v1/conflict");
const Shop = require("./../../../models/v1/shop");

exports.getConflicts = async (req, res) => {
    try {
        const match = {vendor: req.user._id};
        if (req.query.status) match['status'] = req.query.status;
        if (req.query.shop) match['shop'] = req.query.shop;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const conflicts = await Conflict.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'order', select: 'orderNumber status price items'})
            .populate({path: 'customer', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop', select: 'name'});
        const total = await Conflict.countDocuments(match);
        res.status(200).json({message: 'Conflicts retrieved', data: conflicts, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getConflict = async (req, res) => {
    try {
        const conflict = await Conflict.findOne({_id: req.params.id, vendor: req.user._id})
            .populate({path: 'order'})
            .populate({path: 'customer', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop', select: 'name image'})
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

exports.addComment = async (req, res) => {
    try {
        const {text} = req.body;
        if (!text)
            return res.status(400).json({message: 'Comment text is required'});
        const conflict = await Conflict.findOne({_id: req.params.id, vendor: req.user._id, status: {$nin: ['resolved', 'closed']}});
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found or already resolved'});
        conflict.comments.push({user: req.user._id, userModel: 'User', text});
        if (conflict.status === 'awaiting_vendor') conflict.status = 'under_review';
        await conflict.save();
        res.status(200).json({message: 'Comment added', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.acceptResolution = async (req, res) => {
    try {
        const conflict = await Conflict.findOne({_id: req.params.id, vendor: req.user._id});
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found'});
        if (conflict.status === 'resolved' || conflict.status === 'closed')
            return res.status(400).json({message: 'Conflict already resolved'});
        conflict.comments.push({user: req.user._id, userModel: 'User', text: 'Vendor accepted the resolution.'});
        conflict.status = 'resolved';
        await conflict.save();
        res.status(200).json({message: 'Resolution accepted', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
