const {checkPermission} = require("../../../utils/check-permission");
const Order = require("./../../../models/v1/order");

exports.createOrder = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'order', 'create'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const {items, price, destination} = req.body;
        const order = await Order.create({items, price, destination});
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
            .populate({path: 'item.shop'});
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
            match['user'] = req.user._id
        }
        if (req.user.role === 'vendor') {
            match['shop.owner'] = req.user._id
        }
        if (req.query.status) {
            match['status'] = req.query.status;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'item.product'})
            .populate({path: 'shop'});

        const totalOrders = await Order.find(match).countDocuments();
        res.status(200).json({message: 'Order retrieved successfully', data: orders, count: totalOrders});
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