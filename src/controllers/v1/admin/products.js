const Product = require("./../../../models/v1/product");

exports.getProducts = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.variant) {
            match['variant'] = req.query.variant;
        }
        if (req.query.shop) {
            match['shop'] = req.query.shop;
        }
        if (req.query.owner) {
            match['owner'] = req.query.owner;
        }
        if (req.query.query) {
            match['name'] = {$regex: req.query.query, $options: 'i'};
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const products = await Product.find(match)
            .skip(skip).limit(limit).sort({rank: -1, createdAt: -1})
            .populate({path: 'owner', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop', select: 'name'});
        const totalProducts = await Product.countDocuments(match);
        res.status(200).json({message: 'Products retrieved successfully', data: products, count: totalProducts});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({path: 'owner', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'firstName lastName fullName'}});
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        res.status(200).json({message: 'Product retrieved successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.approveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        product.status = 'active';
        await product.save();
        res.status(200).json({message: 'Product approved successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.featureProduct = async (req, res) => {
    try {
        const {status, startDate, endDate} = req.body;
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        product.featured = {status, startDate, endDate};
        await product.save();
        res.status(200).json({message: 'Product featured status updated', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.setSaleProduct = async (req, res) => {
    try {
        const {status, startDate, endDate, price} = req.body;
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        product.sale = {status, startDate, endDate, price};
        await product.save();
        res.status(200).json({message: 'Product sale status updated', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateProductStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const allowedStatuses = ['active', 'deleted', 'pending'];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({message: 'Invalid status'});
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        product.status = status;
        await product.save();
        res.status(200).json({message: `Product status updated to ${status}`, data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
