const ShopVisit = require("./../../../models/v1/shop-visit");
const Shop = require("./../../../models/v1/shop");

exports.getShopVisits = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const match = {shop: {$in: shopIds}};
        if (req.query.shop) {
            match['shop'] = req.query.shop;
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
