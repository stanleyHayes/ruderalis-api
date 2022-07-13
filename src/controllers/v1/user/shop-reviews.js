const Shop = require("./../../../models/v1/shop");
const Review = require("./../../../models/v1/shop-review");
const {checkPermission} = require("../../../utils/check-permission");

exports.createShopReview = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shopReview', 'create'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const {shop, text, rating} = req.body;
        if (rating < 0 || rating > 5)
            return res.status(400).json({message: 'Rating should be between 0 and 5'});
        const existingShop = await Shop.findById(shop);
        if (!existingShop)
            return res.status(404).json({message: 'Shop not found'});
        const existingReview = await Review.findOne({user: req.user._id, shop});
        if (existingReview)
            return res.status(400).json({message: 'You have already submitted a review for this shop'});
        const createdReview = await Review.create({
            user: req.user._id, shop, text, rating
        });
        res.status(201).json({message: 'Review created successfully.', data: createdReview});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getReview = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shopReview', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const review = await Review.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName'});
        if (!review)
            return res.status(404).json({message: 'Review not found'});
        res.status(200).json({message: 'Review successfully retrieved'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getReviews = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shopReview', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const match = {};
        if (req.query.shop) {
            match['shop'] = req.query.shop;
        }
        if (req.query.visible) {
            match['visible'] = req.query.visible === 'true';
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const reviews = await Review.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'fullName'})
            .populate({path: 'shop', select: 'name'});

        const totalReviews = await Review.find(match).countDocuments();
        res.status(200).json({message: 'Reviews retrieved successfully', data: reviews, count: totalReviews})
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateReview = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shopReview', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const review = await Review.findById(req.params.id)
            .populate({path: 'user'});
        if(!review)
            return res.status(404).json({message: 'Review not found'});
        if(req.user.role === 'user'){
            if(req.user._id !== review.user._id)
                return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
            const updates = Object.keys(req.body);
            const allowedUpdates = ['rating', 'text'];
            const isAllowed = updates.every(update => allowedUpdates.includes(update));
            if(!isAllowed)
                return res.status(400).json({message: 'Updates not allowed'});
            for(let key of updates){
                if(key === 'rating'){
                    if(req.body['rating'] < 0 || req.body['rating'] > 5)
                        return res.status(400).json({message: 'Rating should be between 0 and 5'});
                }
                review[key] = req.body[key];
            }
            review['visible'] = false;
            await review.save();
            return res.status(200).json({message: 'Review updated successfully'});
        }
        if(req.user.role === 'vendor'){
            const shop = await Shop.findById(review.shop);
            if(!shop)
                return res.status(404).json({message: 'Shop not found'});
            if(req.user._id !== shop.owner)
                return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
            const updates = Object.keys(req.body);
            const allowedUpdates = ['visible'];
            const isAllowed = updates.every(update => allowedUpdates.includes(update));
            if(!isAllowed)
                return res.status(400).json({message: 'Updates not allowed'});
            for(let key of updates){
                review[key] = req.body[key];
            }
            await review.save();
            return res.status(200).json({message: 'Review updated successfully', data: review});
        }
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteReview = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shopReview', 'remove'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});

        const review = await Review.findById(req.params.id)
            .populate({path: 'user'});
        if(!review)
            return res.status(404).json({message: 'Review not found'});
        if(req.user.role === 'user') {
            if (req.user._id !== review.user._id)
                return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
            await review.remove();
        }
        if(req.user.role === 'vendor'){
            const shop = await Shop.findById(review.shop);
            if(!shop)
                return res.status(404).json({message: 'Shop not found'});
            if(req.user._id !== shop.owner)
                return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
            await review.remove();
            return res.status(200).json({message: 'Review updated successfully', data: review});
        }
        await review.remove();
        return res.status(200).json({message: 'Review updated successfully', data: review});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}