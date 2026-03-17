const Order = require("./../../../models/v1/order");
const Shop = require("./../../../models/v1/shop");

exports.getCustomers = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        if (!shops.length)
            return res.status(200).json({message: 'No customers found', data: [], count: 0});

        const shopIds = shops.map(shop => shop._id);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const customers = await Order.aggregate([
            {$match: {shop: {$in: shopIds}}},
            {$group: {_id: '$user', totalOrders: {$sum: 1}, totalSpent: {$sum: '$price.amount'}, lastOrder: {$max: '$createdAt'}}},
            {$sort: {lastOrder: -1}},
            {$skip: skip},
            {$limit: limit},
            {$lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'user'}},
            {$unwind: '$user'},
            {$project: {'user.password': 0, 'user.pin': 0, 'user.devices': 0, 'user.passwords': 0, 'user.authInfo': 0, 'user.permissions': 0}}
        ]);

        const totalCustomers = await Order.aggregate([
            {$match: {shop: {$in: shopIds}}},
            {$group: {_id: '$user'}},
            {$count: 'total'}
        ]);

        res.status(200).json({
            message: 'Customers retrieved successfully',
            data: customers,
            count: totalCustomers[0] ? totalCustomers[0].total : 0
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
