const Payment = require("./../../../models/v1/payment");
const Order = require("./../../../models/v1/order");
const Shop = require("./../../../models/v1/shop");

exports.getBalance = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const balance = await Order.aggregate([
            {$match: {shop: {$in: shopIds}, status: 'completed'}},
            {$group: {_id: '$price.currency', total: {$sum: '$price.amount'}}}
        ]);
        const withdrawn = await Payment.aggregate([
            {$match: {user: req.user._id, purpose: {$in: ['store-promotion', 'product-promotion', 'daily-payment', 'monthly-payment']}, status: 'success'}},
            {$group: {_id: '$price.currency', total: {$sum: '$price.amount'}}}
        ]);
        res.status(200).json({message: 'Balance retrieved', data: {earnings: balance, expenses: withdrawn}});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getTransactions = async (req, res) => {
    try {
        const match = {user: req.user._id};
        if (req.query.status) match['status'] = req.query.status;
        if (req.query.purpose) match['purpose'] = req.query.purpose;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const transactions = await Payment.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1});
        const total = await Payment.countDocuments(match);
        res.status(200).json({message: 'Transactions retrieved', data: transactions, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.requestWithdrawal = async (req, res) => {
    try {
        const {price, sender, recipient, transactionID} = req.body;
        const payment = await Payment.create({
            user: req.user._id, price, method: 'mobile money',
            sender, recipient, transactionID, purpose: 'monthly-payment'
        });
        res.status(201).json({message: 'Withdrawal request submitted', data: payment});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
