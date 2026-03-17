const ShopVisit = require("./../../../models/v1/shop-visit");
const Shop = require("./../../../models/v1/shop");

exports.createShopVisit = async (req, res) => {
    try {
        const {shop} = req.body;
        if (!shop)
            return res.status(400).json({message: 'Shop is required'});
        const existingShop = await Shop.findById(shop);
        if (!existingShop)
            return res.status(404).json({message: 'Shop not found'});
        const visit = await ShopVisit.create({visitor: req.user._id, shop});
        res.status(201).json({message: 'Shop visit recorded successfully', data: visit});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getShopVisits = async (req, res) => {
    try {
        const match = {};
        if (req.query.shop) {
            match['shop'] = req.query.shop;
        }
        if (req.user.role === 'vendor') {
            const shops = await Shop.find({owner: req.user._id}).select('_id');
            match['shop'] = {$in: shops.map(s => s._id)};
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const visits = await ShopVisit.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'visitor', select: 'firstName lastName fullName'})
            .populate({path: 'shop', select: 'name'});
        const totalVisits = await ShopVisit.countDocuments(match);
        res.status(200).json({message: 'Shop visits retrieved successfully', data: visits, count: totalVisits});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
