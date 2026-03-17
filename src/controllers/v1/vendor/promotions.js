const Promotion = require("./../../../models/v1/promotion");
const moment = require("moment");
const Shop = require("./../../../models/v1/shop");
const Product = require("./../../../models/v1/product");
const Payment = require("./../../../models/v1/payment");

exports.createPromotion = async (req, res) => {
    try {
        const {variant, item, rank, startDate, duration, price, method, sender, recipient, transactionID} = req.body;
        const endDate = moment(startDate).add(duration.amount, duration.unit);
        const status = moment().isBetween(startDate, endDate)
            ? 'active' : moment().isBefore(startDate)
                ? 'pending' : 'expired';

        if (variant === 'shop') {
            const shop = await Shop.findOne({owner: req.user._id, _id: item});
            if (!shop)
                return res.status(404).json({message: 'Shop not found or you are not the owner'});
        } else {
            const product = await Product.findOne({owner: req.user._id, _id: item});
            if (!product)
                return res.status(404).json({message: 'Product not found or you are not the owner'});
        }

        const payment = await Payment.create({
            price, method, sender, recipient, transactionID, user: req.user._id,
            purpose: variant === 'shop' ? 'store-promotion' : 'product-promotion'
        });

        const promotion = await Promotion.create({
            item: variant === 'product' ? {product: item} : {shop: item},
            user: req.user._id,
            variant, rank, price, startDate, duration, endDate, status,
            payment: payment._id
        });

        await promotion.populate({path: 'item.shop', select: 'name'});
        await promotion.populate({path: 'item.product', select: 'name'});
        await promotion.populate({path: 'payment'});

        res.status(201).json({message: 'Promotion created successfully', data: promotion});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPromotions = async (req, res) => {
    try {
        const match = {user: req.user._id};
        if (req.query.variant) {
            match['variant'] = req.query.variant;
        }
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const promotions = await Promotion.find(match)
            .populate({path: 'item.shop', select: 'name'})
            .populate({path: 'item.product', select: 'name'})
            .populate({path: 'payment'})
            .skip(skip).limit(limit).sort({createdAt: -1});
        const totalPromotions = await Promotion.countDocuments(match);
        res.status(200).json({message: 'Promotions retrieved successfully', data: promotions, count: totalPromotions});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findOne({_id: req.params.id, user: req.user._id})
            .populate({path: 'item.shop'})
            .populate({path: 'item.product'})
            .populate({path: 'payment'});
        if (!promotion)
            return res.status(404).json({message: 'Promotion not found'});
        res.status(200).json({message: 'Promotion retrieved successfully', data: promotion});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
