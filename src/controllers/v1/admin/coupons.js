const Coupon = require("./../../../models/v1/coupon");

exports.createCoupon = async (req, res) => {
    try {
        const {code, discount, description, minOrderAmount, maxUses, startDate, endDate} = req.body;
        if (!code || !discount || !startDate || !endDate)
            return res.status(400).json({message: 'Code, discount, start and end dates are required'});
        const coupon = await Coupon.create({
            code, discount, description, minOrderAmount, maxUses, startDate, endDate,
            createdBy: req.admin._id
        });
        res.status(201).json({message: 'Coupon created', data: coupon});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getCoupons = async (req, res) => {
    try {
        const match = {};
        if (req.query.active !== undefined) match['active'] = req.query.active === 'true';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;
        const coupons = await Coupon.find(match).skip(skip).limit(limit).sort({createdAt: -1});
        const total = await Coupon.countDocuments(match);
        res.status(200).json({message: 'Coupons retrieved', data: coupons, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({message: 'Coupon not found'});
        res.status(200).json({message: 'Coupon retrieved', data: coupon});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({message: 'Coupon not found'});
        const allowed = ['code', 'discount', 'description', 'minOrderAmount', 'maxUses', 'startDate', 'endDate', 'active'];
        for (let key of Object.keys(req.body)) {
            if (allowed.includes(key)) coupon[key] = req.body[key];
        }
        await coupon.save();
        res.status(200).json({message: 'Coupon updated', data: coupon});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({message: 'Coupon not found'});
        await coupon.deleteOne();
        res.status(200).json({message: 'Coupon deleted'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
