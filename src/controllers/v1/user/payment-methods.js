const PaymentMethod = require("./../../../models/v1/payment-method");

exports.getPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.find({user: req.user._id}).sort({isDefault: -1, createdAt: -1});
        res.status(200).json({message: 'Payment methods retrieved', data: methods});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getPaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findOne({_id: req.params.id, user: req.user._id});
        if (!method)
            return res.status(404).json({message: 'Payment method not found'});
        res.status(200).json({message: 'Payment method retrieved', data: method});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.createPaymentMethod = async (req, res) => {
    try {
        const {type, provider, number, name, isDefault} = req.body;
        if (!type || !number)
            return res.status(400).json({message: 'Type and number are required'});
        if (isDefault) {
            await PaymentMethod.updateMany({user: req.user._id}, {isDefault: false});
        }
        const method = await PaymentMethod.create({user: req.user._id, type, provider, number, name, isDefault});
        res.status(201).json({message: 'Payment method added', data: method});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.deletePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findOneAndDelete({_id: req.params.id, user: req.user._id});
        if (!method)
            return res.status(404).json({message: 'Payment method not found'});
        res.status(200).json({message: 'Payment method removed'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
