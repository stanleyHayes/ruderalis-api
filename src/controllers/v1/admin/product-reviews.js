const Review = require("./../../../models/v1/review");

exports.getReviews = async (req, res) => {
    try {
        const match = {};
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
            .populate({path: 'product', select: 'name'});
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
            .populate({path: 'product', select: 'name'});
        if (!review)
            return res.status(404).json({message: 'Review not found'});
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
        review.visible = !review.visible;
        await review.save();
        res.status(200).json({message: `Review visibility set to ${review.visible}`, data: review});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review)
            return res.status(404).json({message: 'Review not found'});
        await review.deleteOne();
        res.status(200).json({message: 'Review deleted successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
