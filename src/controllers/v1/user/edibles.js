const Product = require("./../../../models/v1/product");

exports.getEdibles = async (req, res) => {
    try {
        const match = {variant: 'edible', status: {$nin: ['deleted', 'pending']}};
        if (req.query.featured === 'true') match['featured.status'] = true;
        if (req.query.sale === 'true') match['sale.status'] = true;
        if (req.query.search) match['name'] = {$regex: req.query.search, $options: 'i'};
        if (req.query.shop) match['shop'] = req.query.shop;
        if (req.query.strain) match['strain'] = req.query.strain;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;

        const edibles = await Product.find(match).skip(skip).limit(limit)
            .sort({rank: -1, "rating.average": -1, createdAt: -1})
            .populate({path: 'shop', select: 'name contact'})
            .populate({path: 'owner', select: 'fullName'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'fullName'}});
        const total = await Product.countDocuments(match);
        res.status(200).json({message: 'Edibles retrieved successfully', data: edibles, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getEdible = async (req, res) => {
    try {
        const edible = await Product.findOne({_id: req.params.id, variant: 'edible'})
            .populate({path: 'shop'})
            .populate({path: 'owner', select: 'fullName phone'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'fullName'}});
        if (!edible)
            return res.status(404).json({message: 'Edible not found'});
        res.status(200).json({message: 'Edible retrieved successfully', data: edible});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
