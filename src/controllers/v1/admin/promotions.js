const Promotion = require("./../../../models/v1/promotion");

exports.getPromotions = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.variant) {
            match['variant'] = req.query.variant;
        }
        if (req.query.user) {
            match['user'] = req.query.user;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const promotions = await Promotion.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName email phone'})
            .populate({path: 'item.shop', select: 'name'})
            .populate({path: 'item.product', select: 'name'})
            .populate({path: 'payment'});
        const totalPromotions = await Promotion.countDocuments(match);
        res.status(200).json({message: 'Promotions retrieved successfully', data: promotions, count: totalPromotions});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName email phone'})
            .populate({path: 'item.shop'})
            .populate({path: 'item.product'})
            .populate({path: 'payment'});
        if (!promotion)
            return res.status(404).json({message: 'Promotion not found'});
        res.status(200).json({message: 'Promotion retrieved successfully', data: promotion});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updatePromotionStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const allowedStatuses = ['pending', 'active', 'expired'];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({message: 'Invalid status'});
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion)
            return res.status(404).json({message: 'Promotion not found'});
        promotion.status = status;
        await promotion.save();
        res.status(200).json({message: `Promotion status updated to ${status}`, data: promotion});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
