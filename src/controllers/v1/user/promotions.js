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
            ? 'active' : moment().isAfter(startDate)
                ? 'pending' : 'expired';

        const payment = await Payment.create({
            price, method, sender, recipient, transactionID, user: req.user._id
        });

        if (variant === 'shop') {
            const shop = await Shop.findOne({user: req.user._id, _id: item});
            if (!shop)
                return res.status(404).json({message: 'Shop not found'});
        } else {
            const product = await Product.findOne({user: req.user._id, _id: item});
            if (!product)
                return res.status(404).json({message: 'Product not found'});
        }
        const promotion = await Promotion.create({
            item: variant === 'product' ? {product: item} : {shop: item},
            user: req.user._id,
            variant,
            rank,
            price,
            startDate,
            duration,
            endDate,
            status,
            payment: payment._id
        });

        await promotion.populate({path: 'item.shop'});
        await promotion.populate({path: 'item.product'});
        await promotion.populate({path: 'user'});
        await promotion.populate({path: 'payment'});

        res.status(201).json({message: 'Promotion submitted successfully', data: promotion});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findOne({_id: req.params.id, user: req.user._id})
            .populate({path: 'item.shop'})
            .populate({path: 'item.product'})
            .populate({path: 'user'});

        if (!promotion)
            return res.status(404).json({message: 'Promotion not found'});

        res.status(200).json({message: 'Promotion submitted successfully', data: promotion});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPromotions = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.params.size) || 50;
        const skip = (page - 1) * limit;
        const match = {};
        match['user'] = req.user._id;
        if (req.query.variant) {
            match['variant'] = req.query.variant;
        }
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        const products = await Promotion.find(match)
            .populate({path: 'item.shop'})
            .populate({path: 'item.product'})
            .populate({path: 'user'})
            .skip(skip).limit(limit).sort({createdAt: -1});
        const totalProducts = await Promotion.find(match).countDocuments();

        res.status(200).json({message: 'Promotion submitted successfully', data: products, count: totalProducts});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}