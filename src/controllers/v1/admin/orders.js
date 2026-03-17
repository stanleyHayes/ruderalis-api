const Order = require("./../../../models/v1/order");

exports.getOrders = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.shop) {
            match['shop'] = req.query.shop;
        }
        if (req.query.user) {
            match['user'] = req.query.user;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop', select: 'name'})
            .populate({path: 'items.product', select: 'name image price variant'});
        const totalOrders = await Order.countDocuments(match);
        res.status(200).json({message: 'Orders retrieved successfully', data: orders, count: totalOrders});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName email phone address'})
            .populate({path: 'shop'})
            .populate({path: 'items.product'});
        if (!order)
            return res.status(404).json({message: 'Order not found'});
        res.status(200).json({message: 'Order retrieved successfully', data: order});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateOrderStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const allowedStatuses = ['pending', 'delivering', 'completed', 'cancelled'];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({message: 'Invalid status'});
        const order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({message: 'Order not found'});
        order.status = status;
        await order.save();
        res.status(200).json({message: `Order status updated to ${status}`, data: order});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
