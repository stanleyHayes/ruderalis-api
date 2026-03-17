const Review = require("./../../../models/v1/review");
const Product = require("./../../../models/v1/product");

exports.getReviews = async (req, res) => {
    try {
        const products = await Product.find({owner: req.user._id}).select('_id');
        const productIds = products.map(p => p._id);
        const match = {product: {$in: productIds}};
        if (req.query.product) {
            match['product'] = req.query.product;
        }
        if (req.query.visible !== undefined) {
            match['visible'] = req.query.visible === 'true';
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const reviews = await Review.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName'})
            .populate({path: 'product', select: 'name image'});
        const totalReviews = await Review.countDocuments(match);
        res.status(200).json({message: 'Reviews retrieved successfully', data: reviews, count: totalReviews});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName'})
            .populate({path: 'product', select: 'name image'});
        if (!review)
            return res.status(404).json({message: 'Review not found'});
        const product = await Product.findOne({_id: review.product._id || review.product, owner: req.user._id});
        if (!product)
            return res.status(403).json({message: 'You do not own this product'});
        res.status(200).json({message: 'Review retrieved successfully', data: review});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.toggleReviewVisibility = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review)
            return res.status(404).json({message: 'Review not found'});
        const product = await Product.findOne({_id: review.product, owner: req.user._id});
        if (!product)
            return res.status(403).json({message: 'You do not own this product'});
        review.visible = !review.visible;
        await review.save();
        res.status(200).json({message: `Review visibility set to ${review.visible}`, data: review});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
