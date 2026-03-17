const Wishlist = require("./../../../models/v1/wishlist");

exports.getWishlists = async (req, res) => {
    try {
        const wishlists = await Wishlist.find({user: req.user._id})
            .populate({path: 'product', populate: {path: 'shop', select: 'name'}})
            .sort({createdAt: -1});
        res.status(200).json({message: 'Wishlists retrieved successfully', data: wishlists});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.addToWishlist = async (req, res) => {
    try {
        const {product} = req.body;
        if (!product)
            return res.status(400).json({message: 'Product is required'});
        const existing = await Wishlist.findOne({user: req.user._id, product});
        if (existing)
            return res.status(409).json({message: 'Product already in wishlist'});
        const wishlist = await Wishlist.create({user: req.user._id, product});
        await wishlist.populate({path: 'product'});
        res.status(201).json({message: 'Added to wishlist', data: wishlist});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOneAndDelete({_id: req.params.id, user: req.user._id});
        if (!wishlist)
            return res.status(404).json({message: 'Wishlist item not found'});
        res.status(200).json({message: 'Removed from wishlist'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
