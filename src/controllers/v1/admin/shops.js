const Shop = require("./../../../models/v1/shop");

exports.getShops = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.query) {
            match['name'] = {$regex: req.query.query, $options: 'i'};
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const shops = await Shop.find(match)
            .skip(skip).limit(limit).sort({rank: -1, createdAt: -1})
            .populate({path: 'owner', select: 'firstName lastName fullName email phone'});
        const totalShops = await Shop.countDocuments(match);
        res.status(200).json({message: 'Shops retrieved successfully', data: shops, count: totalShops});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id)
            .populate({path: 'owner', select: 'firstName lastName fullName email phone'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'firstName lastName fullName'}})
            .populate({path: 'products'})
            .populate({path: 'productCount'});
        if (!shop)
            return res.status(404).json({message: 'Shop not found'});
        res.status(200).json({message: 'Shop retrieved successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.approveShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop)
            return res.status(404).json({message: 'Shop not found'});
        shop.status = 'active';
        await shop.save();
        res.status(200).json({message: 'Shop approved successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.suspendShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop)
            return res.status(404).json({message: 'Shop not found'});
        shop.status = 'suspended';
        await shop.save();
        res.status(200).json({message: 'Shop suspended successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.featureShop = async (req, res) => {
    try {
        const {value, startDate, endDate} = req.body;
        const shop = await Shop.findById(req.params.id);
        if (!shop)
            return res.status(404).json({message: 'Shop not found'});
        shop.featured = {value, startDate, endDate};
        await shop.save();
        res.status(200).json({message: 'Shop featured status updated', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateShopStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const allowedStatuses = ['pending', 'suspended', 'frozen', 'deleted', 'active'];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({message: 'Invalid status'});
        const shop = await Shop.findById(req.params.id);
        if (!shop)
            return res.status(404).json({message: 'Shop not found'});
        shop.status = status;
        await shop.save();
        res.status(200).json({message: `Shop status updated to ${status}`, data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
