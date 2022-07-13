const Payment = require("./../../../models/v1/payment");

exports.makePayment = async (req, res) => {
    try {
        const {price, method, sender, recipient, transactionID} = req.body;
        const payment = await Payment.create({
            user: req.user._id,
            price,
            method,
            sender,
            recipient,
            transactionID
        });
        res.status(201).json({message: 'Payment submitted', data: payment});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({_id: req.params.id, user: req.user._id})
            .populate({path: 'user'});
        if(!payment)
            return res.status(404).json({message: 'Payment not found'});
        res.status(200).json({message: 'Payment retrieved', data: payment});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getPayments = async (req, res) => {
    try {
        const match = {};
        match['user'] = req.user._id;
        if(req.query.status){
            match['status'] = req.query.status;
        }
        if(req.query.method){
            match['method'] = req.query.method;
        }
        if(req.query.senderProvider){
            match['sender.provider'] = req.query.senderProvider
        }
        if(req.query.recipientProvider){
            match['recipient.provider'] = req.query.recipientProvider
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;
        const payments = await Payment.find(match).limit(limit).skip(skip).sort({createdAt: -1});
        const totalPayments = await Payment.find(match).countDocuments();
        res.status(200).json({message: 'Payments retrieved', data: payments, count: totalPayments});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


