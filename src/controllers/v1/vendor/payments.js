const Payment = require("./../../../models/v1/payment");

exports.getPayments = async (req, res) => {
    try {
        const match = {user: req.user._id};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.purpose) {
            match['purpose'] = req.query.purpose;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const payments = await Payment.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1});
        const totalPayments = await Payment.countDocuments(match);
        res.status(200).json({message: 'Payments retrieved successfully', data: payments, count: totalPayments});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({_id: req.params.id, user: req.user._id});
        if (!payment)
            return res.status(404).json({message: 'Payment not found'});
        res.status(200).json({message: 'Payment retrieved successfully', data: payment});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
