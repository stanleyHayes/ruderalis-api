const Conflict = require("./../../../models/v1/conflict");
const Order = require("./../../../models/v1/order");
const {uploadImage} = require("./../../../utils/upload");

exports.createConflict = async (req, res) => {
    try {
        const {order, reason, description, evidence} = req.body;
        if (!order || !reason || !description)
            return res.status(400).json({message: 'Order, reason, and description are required'});
        const existingOrder = await Order.findOne({_id: order, user: req.user._id}).populate({path: 'shop'});
        if (!existingOrder)
            return res.status(404).json({message: 'Order not found'});
        const existing = await Conflict.findOne({order, customer: req.user._id, status: {$nin: ['resolved', 'closed']}});
        if (existing)
            return res.status(409).json({message: 'You already have an open conflict for this order'});

        let uploadedEvidence = [];
        if (evidence && evidence.length) {
            for (const img of evidence) {
                const result = await uploadImage(img, {});
                uploadedEvidence.push(result.url);
            }
        }

        const conflict = await Conflict.create({
            order, customer: req.user._id,
            vendor: existingOrder.shop.owner,
            shop: existingOrder.shop._id,
            reason, description,
            evidence: uploadedEvidence,
            comments: [{user: req.user._id, userModel: 'User', text: description}]
        });
        await conflict.populate([
            {path: 'order', select: 'orderNumber status price'},
            {path: 'shop', select: 'name'}
        ]);
        res.status(201).json({message: 'Conflict submitted successfully. Our team will review it shortly.', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getConflicts = async (req, res) => {
    try {
        const match = {customer: req.user._id};
        if (req.query.status) match['status'] = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const conflicts = await Conflict.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'order', select: 'orderNumber status price'})
            .populate({path: 'shop', select: 'name'});
        const total = await Conflict.countDocuments(match);
        res.status(200).json({message: 'Conflicts retrieved', data: conflicts, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getConflict = async (req, res) => {
    try {
        const conflict = await Conflict.findOne({_id: req.params.id, customer: req.user._id})
            .populate({path: 'order'})
            .populate({path: 'shop', select: 'name image'})
            .populate({path: 'vendor', select: 'firstName lastName fullName'})
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
        const conflict = await Conflict.findOne({_id: req.params.id, customer: req.user._id, status: {$nin: ['resolved', 'closed']}});
        if (!conflict)
            return res.status(404).json({message: 'Conflict not found or already resolved'});
        conflict.comments.push({user: req.user._id, userModel: 'User', text});
        if (conflict.status === 'awaiting_customer') conflict.status = 'under_review';
        await conflict.save();
        res.status(200).json({message: 'Comment added', data: conflict});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
