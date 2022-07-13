const Shop = require("./../../../models/v1/shop");
const Product = require("./../../../models/v1/product");
const ShopReview = require("./../../../models/v1/shop-review");

const {checkPermission} = require("../../../utils/check-permission");
const {uploadImage} = require("./../../../utils/upload");

exports.createShop = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shop', 'create'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})
        const {name, contact, description, image, destinations} = req.body;
        const uploadResult = await uploadImage(image, {});
        const shop = await Shop.create({
            image: uploadResult.url,
            owner: req.user._id,
            name,
            contact,
            description,
            destinations
        });

        await shop.populate({path: 'owner'});
        res.status(201).json({
            message: 'Shop Created Successfully',
            data: shop
        });

    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getShop = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shop', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})
        const {id} = req.params;
        const shop = await Shop.findById(id).populate(
            {
                path: 'owner', select: 'firstName lastName fullName image phone email'
            }).populate({path: 'reviews', populate: {path: 'user'}})
            .populate({path: 'products'})
            .populate({path: 'productCount'})
            .populate({path: 'featuredProducts'})
            .populate({path: 'onSaleProducts'});
        if (!shop)
            return res.status(404).json({message: 'Shop not found'});
        res.status(200).json({message: 'Shop Retrieved Successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getShops = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shop', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})
        const match = {};
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;
        if (req.query.owner) {
            match['owner'] = req.query.owner;
        }
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        const shops = await Shop.find(match).skip(skip).limit(limit).sort({
            rank: -1,
            "rating.average": -1,
            createdAt: -1
        }).populate({path: 'reviews', populate: {path: 'user'}})
            .populate({path: 'owner', select: 'firstName lastName fullName image phone email'});
        const totalShops =  await Shop.find(match).countDocuments();
        res.status(200).json({message: 'Shops Retrieved Successfully', data: shops, count: totalShops});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateShop = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shop', 'update'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'});
        const shop = await Shop.findOne({owner: req.user._id, _id: req.params.id})
            .populate({path: 'owner'})
            .populate({path: 'reviews', populate: {path: 'user'}})
            .populate({path: 'products'})
            .populate({path: 'productCount'})
            .populate({path: 'featuredProducts'})
            .populate({path: 'onSaleProducts'});

        if(!shop)
            return res.status(404).json({message: 'Shop not found'});

        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'contact', 'description', 'image', 'destinations'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if(!isAllowed)
            return res.status(400).json({message: 'Updates not allowed'});
        for(let key of updates){
            shop[key] = req.body[key];
        }
        await shop.save();
        res.status(200).json({message: 'Shops Updated Successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteShop = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'shop', 'remove'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        const shop = await Shop.findOne({owner: req.user._id, _id: req.params.id});

        if(!shop)
            return res.status(404).json({message: 'Shop not found'});
        shop.status = 'deleted';
        await Product.updateMany({shop: shop._id}, {status: 'deleted'});
        await ShopReview.deleteMany({shop: shop._id});
        await shop.save();
        res.status(200).json({message: 'Shop Removed Successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}