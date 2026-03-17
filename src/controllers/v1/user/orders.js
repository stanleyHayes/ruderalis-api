const {checkPermission} = require("../../../utils/check-permission");
const Order = require("./../../../models/v1/order");
const Coupon = require("./../../../models/v1/coupon");
const Product = require("./../../../models/v1/product");
const {validateCouponEligibility, calculateDiscount} = require("./coupons");

exports.createOrder = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'order', 'create'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const {items, price, destination, shop, shippingAddress, paymentMethod, notes, couponCode, subtotal, tax, shipping} = req.body;
        if (!shop)
            return res.status(400).json({message: 'Shop is required'});

        let couponData = {};
        let discount = 0;
        let freeShipping = false;

        if (couponCode) {
            const coupon = await Coupon.findOne({code: couponCode.toUpperCase()});
            if (coupon) {
                // Gather product info for eligibility checks
                const productIds = items.map(i => i.product);
                const products = await Product.find({_id: {$in: productIds}}).select('category variant');
                const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
                const variants = [...new Set(products.map(p => p.variant).filter(Boolean))];

                const eligibility = await validateCouponEligibility(coupon, req.user._id, req.user.role, {
                    subtotal: subtotal || price.amount,
                    shopId: shop,
                    productIds,
                    categories,
                    variants,
                    itemCount: items.length,
                    userCreatedAt: req.user.createdAt
                });

                if (eligibility.valid) {
                    discount = calculateDiscount(coupon, subtotal || price.amount);
                    freeShipping = coupon.freeShipping;
                    couponData = {code: coupon.code, discount};

                    // Track usage
                    const userUsageIdx = coupon.usedBy.findIndex(u => u.user.toString() === req.user._id.toString());
                    if (userUsageIdx >= 0) {
                        coupon.usedBy[userUsageIdx].count += 1;
                        coupon.usedBy[userUsageIdx].lastUsed = new Date();
                    } else {
                        coupon.usedBy.push({user: req.user._id, count: 1});
                    }
                    coupon.usedCount += 1;
                    await coupon.save();
                }
            }
        }

        const shippingCost = freeShipping ? 0 : (shipping || 0);
        const finalAmount = (subtotal || price.amount) + (tax || 0) + shippingCost - discount;

        const order = await Order.create({
            items, destination, shop, user: req.user._id,
            price: {amount: Math.max(finalAmount, 0), currency: price.currency || 'GHS'},
            subtotal: subtotal || price.amount,
            tax: tax || 0,
            shipping: shippingCost,
            shippingAddress, paymentMethod, notes,
            coupon: couponData
        });
        res.status(201).json({message: 'Order Created Successfully', data: order});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getOrder = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'order', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const order = await Order.findOne({_id: req.params.id, user: req.user._id})
            .populate({path: 'items.product', populate: {path: 'shop'}})
            .populate({path: 'shop'})
            .populate({path: 'user', select: 'firstName lastName fullName email phone'});
        if (!order)
            return res.status(404).json({message: 'Order not found'});
        res.status(200).json({message: 'Order retrieved successfully', data: order});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getOrders = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'order', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const match = {};
        if (req.user.role === 'user') {
            match['user'] = req.user._id;
        }
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.shop) {
            match['shop'] = req.query.shop;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'items.product'})
            .populate({path: 'shop'})
            .populate({path: 'user', select: 'firstName lastName fullName email phone'});

        const totalOrders = await Order.countDocuments(match);
        res.status(200).json({message: 'Orders retrieved successfully', data: orders, count: totalOrders});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateOrder = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'order', 'update'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const order = await Order.findOne({
            user: req.user._id,
            _id: req.params.id,
            status: 'pending'
        });
        if (!order)
            return res.status(404).json({message: 'Order not found or cannot be updated'});
        const updates = Object.keys(req.body);
        const allowedUpdates = ['destination'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Update not allowed'});
        for (let key of updates) {
            order[key] = req.body[key];
        }
        await order.save();
        res.status(200).json({message: 'Order updated successfully', data: order});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.cancelOrder = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'order', 'update'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const order = await Order.findOne({
            user: req.user._id,
            _id: req.params.id,
            status: 'pending'
        });
        if (!order)
            return res.status(404).json({message: 'Order not found or cannot be cancelled'});
        order.status = 'cancelled';
        await order.save();
        res.status(200).json({message: 'Order cancelled successfully', data: order});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
