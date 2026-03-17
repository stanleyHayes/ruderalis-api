const Product = require("./../../../models/v1/product");
const Shop = require("./../../../models/v1/shop");
const Review = require("../../../models/v1/review");
const {uploadImage} = require("./../../../utils/upload");


exports.createProduct = async (req, res) => {
    try {
        const {name, shop, stock, price, description, image, details, variant} = req.body;
        const existingShop = await Shop.findOne({_id: shop, owner: req.user._id});
        if (!existingShop)
            return res.status(404).json({message: 'Shop not found or you are not the owner'});
        const metadata = {};
        if (variant === 'marijuana') metadata['marijuana'] = details;
        if (variant === 'edible') metadata['edible'] = details;
        if (variant === 'accessory') metadata['accessory'] = details;
        const uploadedImage = await uploadImage(image, {});
        const product = await Product.create({
            name, shop, stock, price, description,
            image: uploadedImage.url,
            variant, metadata, owner: req.user._id
        });
        res.status(201).json({message: 'Product Created Successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getProducts = async (req, res) => {
    try {
        const match = {owner: req.user._id};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.shop) {
            match['shop'] = req.query.shop;
        }
        if (req.query.variant) {
            match['variant'] = req.query.variant;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;

        const products = await Product.find(match).skip(skip).limit(limit).sort({
            rank: -1, "rating.average": -1, createdAt: -1
        }).populate({path: 'shop', select: 'name'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'firstName lastName fullName'}});
        const totalProducts = await Product.countDocuments(match);
        res.status(200).json({message: 'Products Retrieved Successfully', data: products, count: totalProducts});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({_id: req.params.id, owner: req.user._id})
            .populate({path: 'owner', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'firstName lastName fullName'}});
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        res.status(200).json({message: 'Product Retrieved Successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({owner: req.user._id, _id: req.params.id});
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'description', 'image', 'stock', 'price', 'metadata', 'category', 'strain', 'thc', 'cbd', 'weight', 'sku', 'tags'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Updates not allowed'});
        for (let key of updates) {
            if (key === 'image') {
                const image = await uploadImage(req.body.image, {});
                product.image = image.url;
                continue;
            }
            product[key] = req.body[key];
        }
        await product.save();
        res.status(200).json({message: 'Product Updated Successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({owner: req.user._id, _id: req.params.id});
        if (!product)
            return res.status(404).json({message: 'Product not found'});
        product.status = 'deleted';
        await Review.deleteMany({product: product._id});
        await product.save();
        res.status(200).json({message: 'Product Removed Successfully', data: {}});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
