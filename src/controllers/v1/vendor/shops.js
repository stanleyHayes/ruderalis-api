const Shop = require("./../../../models/v1/shop");
const Product = require("./../../../models/v1/product");
const ShopReview = require("./../../../models/v1/shop-review");
const {uploadImage} = require("./../../../utils/upload");

exports.createShop = async (req, res) => {
    try {
        const {name, contact, description, image, destinations} = req.body;
        const uploadResult = await uploadImage(image, {});
        const shop = await Shop.create({
            image: uploadResult.url,
            owner: req.user._id,
            name, contact, description, destinations
        });
        await shop.populate({path: 'owner', select: 'firstName lastName fullName email phone'});
        res.status(201).json({message: 'Shop Created Successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getShops = async (req, res) => {
    try {
        const match = {owner: req.user._id};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;

        const shops = await Shop.find(match).skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'reviews', populate: {path: 'user', select: 'firstName lastName fullName'}})
            .populate({path: 'productCount'});
        const totalShops = await Shop.countDocuments(match);
        res.status(200).json({message: 'Shops Retrieved Successfully', data: shops, count: totalShops});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({_id: req.params.id, owner: req.user._id})
            .populate({path: 'owner', select: 'firstName lastName fullName email phone'})
            .populate({path: 'reviews', populate: {path: 'user', select: 'firstName lastName fullName'}})
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


exports.updateShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({owner: req.user._id, _id: req.params.id});
        if (!shop)
            return res.status(404).json({message: 'Shop not found'});
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'contact', 'description', 'image', 'destinations', 'operatingHours', 'license', 'paymentDetails', 'shippingRates', 'address', 'notifications'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Updates not allowed'});
        for (let key of updates) {
            if (key === 'image') {
                const uploadResult = await uploadImage(req.body.image, {});
                shop.image = uploadResult.url;
                continue;
            }
            shop[key] = req.body[key];
        }
        await shop.save();
        res.status(200).json({message: 'Shop Updated Successfully', data: shop});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({owner: req.user._id, _id: req.params.id});
        if (!shop)
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
