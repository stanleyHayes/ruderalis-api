const Product = require("./../../../models/v1/product");

exports.getAccessories = async (req, res) => {
    try {
        const match = {variant: 'accessory', status: {$nin: ['deleted', 'pending']}};
        if (req.query.featured === 'true') match['featured.status'] = true;
        if (req.query.search) match['name'] = {$regex: req.query.search, $options: 'i'};
        if (req.query.shop) match['shop'] = req.query.shop;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;

        const accessories = await Product.find(match).skip(skip).limit(limit)
            .sort({rank: -1, "rating.average": -1, createdAt: -1})
            .populate({path: 'shop', select: 'name contact'})
            .populate({path: 'owner', select: 'fullName'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'fullName'}});
        const total = await Product.countDocuments(match);
        res.status(200).json({message: 'Accessories retrieved successfully', data: accessories, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getAccessory = async (req, res) => {
    try {
        const accessory = await Product.findOne({_id: req.params.id, variant: 'accessory'})
            .populate({path: 'shop'})
            .populate({path: 'owner', select: 'fullName phone'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'fullName'}});
        if (!accessory)
            return res.status(404).json({message: 'Accessory not found'});
        res.status(200).json({message: 'Accessory retrieved successfully', data: accessory});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
