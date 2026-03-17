const Order = require("./../../../models/v1/order");

exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.code)
            .populate({path: 'shop', select: 'name contact'})
            .populate({path: 'items.product', select: 'name image price'})
            .select('status items price destination createdAt updatedAt');
        if (!order)
            return res.status(404).json({message: 'Order not found'});
        res.status(200).json({message: 'Order tracking retrieved', data: order});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
