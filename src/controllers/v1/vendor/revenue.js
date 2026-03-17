const Order = require("./../../../models/v1/order");
const Shop = require("./../../../models/v1/shop");

exports.getSummary = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const summary = await Order.aggregate([
            {$match: {shop: {$in: shopIds}, status: 'completed'}},
            {$group: {_id: '$price.currency', total: {$sum: '$price.amount'}, orderCount: {$sum: 1}}}
        ]);
        res.status(200).json({message: 'Revenue summary retrieved', data: summary});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getMonthly = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const match = {shop: {$in: shopIds}, status: 'completed'};
        if (req.query.year) {
            const year = parseInt(req.query.year);
            match['createdAt'] = {$gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1)};
        }
        const monthly = await Order.aggregate([
            {$match: match},
            {$group: {
                _id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}},
                total: {$sum: '$price.amount'},
                orderCount: {$sum: 1}
            }},
            {$sort: {'_id.year': 1, '_id.month': 1}}
        ]);
        res.status(200).json({message: 'Monthly revenue retrieved', data: monthly});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
