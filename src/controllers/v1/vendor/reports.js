const Order = require("./../../../models/v1/order");
const Product = require("./../../../models/v1/product");
const Shop = require("./../../../models/v1/shop");

exports.getSalesReport = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const match = {shop: {$in: shopIds}};
        if (req.query.startDate || req.query.endDate) {
            match['createdAt'] = {};
            if (req.query.startDate) match['createdAt']['$gte'] = new Date(req.query.startDate);
            if (req.query.endDate) match['createdAt']['$lte'] = new Date(req.query.endDate);
        }
        if (req.query.status) match['status'] = req.query.status;

        const sales = await Order.aggregate([
            {$match: match},
            {$group: {
                _id: {$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}},
                count: {$sum: 1}, revenue: {$sum: '$price.amount'}
            }},
            {$sort: {_id: -1}}
        ]);
        res.status(200).json({message: 'Sales report retrieved', data: sales});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getProductsReport = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const match = {shop: {$in: shopIds}};
        if (req.query.startDate || req.query.endDate) {
            match['createdAt'] = {};
            if (req.query.startDate) match['createdAt']['$gte'] = new Date(req.query.startDate);
            if (req.query.endDate) match['createdAt']['$lte'] = new Date(req.query.endDate);
        }
        const products = await Order.aggregate([
            {$match: match},
            {$unwind: '$items'},
            {$group: {_id: '$items.product', totalSold: {$sum: '$items.quantity'}, revenue: {$sum: '$price.amount'}}},
            {$sort: {totalSold: -1}},
            {$lookup: {from: 'products', localField: '_id', foreignField: '_id', as: 'product'}},
            {$unwind: '$product'},
            {$project: {'product.name': 1, 'product.image': 1, 'product.price': 1, 'product.variant': 1, totalSold: 1, revenue: 1}}
        ]);
        res.status(200).json({message: 'Products report retrieved', data: products});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getCustomersReport = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const customers = await Order.aggregate([
            {$match: {shop: {$in: shopIds}}},
            {$group: {_id: '$user', totalOrders: {$sum: 1}, totalSpent: {$sum: '$price.amount'}, lastOrder: {$max: '$createdAt'}}},
            {$sort: {totalSpent: -1}},
            {$limit: 50},
            {$lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'user'}},
            {$unwind: '$user'},
            {$project: {'user.firstName': 1, 'user.lastName': 1, 'user.fullName': 1, 'user.email': 1, totalOrders: 1, totalSpent: 1, lastOrder: 1}}
        ]);
        res.status(200).json({message: 'Customers report retrieved', data: customers});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getFinancialReport = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const match = {shop: {$in: shopIds}, status: 'completed'};
        if (req.query.startDate || req.query.endDate) {
            match['createdAt'] = {};
            if (req.query.startDate) match['createdAt']['$gte'] = new Date(req.query.startDate);
            if (req.query.endDate) match['createdAt']['$lte'] = new Date(req.query.endDate);
        }
        const revenue = await Order.aggregate([
            {$match: match},
            {$group: {
                _id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}},
                revenue: {$sum: '$price.amount'}, orders: {$sum: 1}
            }},
            {$sort: {'_id.year': 1, '_id.month': 1}}
        ]);
        res.status(200).json({message: 'Financial report retrieved', data: revenue});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
