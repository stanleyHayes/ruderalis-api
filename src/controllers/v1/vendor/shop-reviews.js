const ShopReview = require("./../../../models/v1/shop-review");
const Shop = require("./../../../models/v1/shop");

exports.getReviews = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const match = {shop: {$in: shopIds}};
        if (req.query.shop) {
            match['shop'] = req.query.shop;
        }
        if (req.query.visible !== undefined) {
            match['visible'] = req.query.visible === 'true';
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const reviews = await ShopReview.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName'})
            .populate({path: 'shop', select: 'name'});
        const totalReviews = await ShopReview.countDocuments(match);
        res.status(200).json({message: 'Shop reviews retrieved successfully', data: reviews, count: totalReviews});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getReview = async (req, res) => {
    try {
        const review = await ShopReview.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName'})
            .populate({path: 'shop', select: 'name'});
        if (!review)
            return res.status(404).json({message: 'Shop review not found'});
        const shop = await Shop.findOne({_id: review.shop._id || review.shop, owner: req.user._id});
        if (!shop)
            return res.status(403).json({message: 'You do not own this shop'});
        res.status(200).json({message: 'Shop review retrieved successfully', data: review});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.toggleReviewVisibility = async (req, res) => {
    try {
        const review = await ShopReview.findById(req.params.id);
        if (!review)
            return res.status(404).json({message: 'Shop review not found'});
        const shop = await Shop.findOne({_id: review.shop, owner: req.user._id});
        if (!shop)
            return res.status(403).json({message: 'You do not own this shop'});
        review.visible = !review.visible;
        await review.save();
        res.status(200).json({message: `Shop review visibility set to ${review.visible}`, data: review});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
