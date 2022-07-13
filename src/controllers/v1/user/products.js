const Product = require("./../../../models/v1/product");
const Shop = require("./../../../models/v1/shop");
const Review = require("../../../models/v1/review");
const {uploadImage} = require("./../../../utils/upload");

const {checkPermission} = require("../../../utils/check-permission");


exports.createProduct = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'product', 'create'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})
        const {name, shop, stock, price, description, image, details, variant} = req.body;
        const existingShop = await Shop.findById(shop);
        if (!existingShop)
            return res.status(404).json({message: 'Shop does not exist'});
        const metadata = {};
        if (variant === 'marijuana') {
            metadata['marijuana'] = details;
        }
        if (variant === 'edible') {
            metadata['edible'] = details;
        }
        if (variant === 'accessory') {
            metadata['accessory'] = details;
        }
        const uploadedImage = await uploadImage(image, {});
        const product = await Product.create({
            name,
            shop,
            stock,
            price,
            description,
            image: uploadedImage.url,
            variant,
            metadata,
            owner: req.user._id
        });
        res.status(201).json({message: 'Product Created Successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getProduct = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'product', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})
        const product = await Product.findById(req.params.id)
            .populate({path: 'owner'})
            .populate({path: 'reviews', populate: {path: 'user'}})
            .populate({path: 'shop'});

        if (!product)
            return res.status(404).json({message: 'Product not found'});
        res.status(200).json({message: 'Product Retrieved Successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getProducts = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'product', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        const match = {};
        if (req.user.role === 'user') {
            match['status'] = {$nin: ['deleted', 'pending']}
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;
        if (req.query.owner) {
            match['owner'] = req.query.owner;
        }
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        const products = await Product.find(match).skip(skip).limit(limit).sort({
            rank: -1,
            "rating.average": -1,
            createdAt: -1
        }).populate({path: 'reviews', populate: {path: 'user'}});
        const totalProducts = await Product.find(match).countDocuments();

        res.status(200).json({message: 'Products Retrieved Successfully', data: products, count: totalProducts});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateProduct = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'product', 'update'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        const product = await Product.findOne({owner: req.user._id, _id: req.params.id})
            .populate({path: 'owner'})
            .populate({path: 'reviews', populate: {path: 'user'}})

        if (!product)
            return res.status(404).json({message: 'Product not found'});

        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'contact', 'description', 'image', 'stock', 'price', 'metadata'];
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

        res.status(200).json({message: 'Products Updated Successfully', data: product});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'product', 'remove'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})
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