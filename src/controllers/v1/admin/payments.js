const Payment = require("./../../../models/v1/payment");

exports.getPayments = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.method) {
            match['method'] = req.query.method;
        }
        if (req.query.user) {
            match['user'] = req.query.user;
        }
        if (req.query.purpose) {
            match['purpose'] = req.query.purpose;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const payments = await Payment.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName email phone'});
        const totalPayments = await Payment.countDocuments(match);
        res.status(200).json({message: 'Payments retrieved successfully', data: payments, count: totalPayments});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName email phone'});
        if (!payment)
            return res.status(404).json({message: 'Payment not found'});
        res.status(200).json({message: 'Payment retrieved successfully', data: payment});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updatePaymentStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const allowedStatuses = ['pending', 'failed', 'success'];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({message: 'Invalid status'});
        const payment = await Payment.findById(req.params.id);
        if (!payment)
            return res.status(404).json({message: 'Payment not found'});
        payment.status = status;
        await payment.save();
        res.status(200).json({message: `Payment status updated to ${status}`, data: payment});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
