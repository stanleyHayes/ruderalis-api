const Address = require("./../../../models/v1/address");

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({user: req.user._id}).sort({isDefault: -1, createdAt: -1});
        res.status(200).json({message: 'Addresses retrieved successfully', data: addresses});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getAddress = async (req, res) => {
    try {
        const address = await Address.findOne({_id: req.params.id, user: req.user._id});
        if (!address)
            return res.status(404).json({message: 'Address not found'});
        res.status(200).json({message: 'Address retrieved successfully', data: address});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.createAddress = async (req, res) => {
    try {
        const {label, street, city, region, country, gpAddressOrHouseNumber, landmark, isDefault} = req.body;
        if (!street || !city || !country)
            return res.status(400).json({message: 'Street, city, and country are required'});
        if (isDefault) {
            await Address.updateMany({user: req.user._id}, {isDefault: false});
        }
        const address = await Address.create({
            user: req.user._id, label, street, city, region, country,
            gpAddressOrHouseNumber, landmark, isDefault
        });
        res.status(201).json({message: 'Address created successfully', data: address});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateAddress = async (req, res) => {
    try {
        const address = await Address.findOne({_id: req.params.id, user: req.user._id});
        if (!address)
            return res.status(404).json({message: 'Address not found'});
        const updates = Object.keys(req.body);
        const allowedUpdates = ['label', 'street', 'city', 'region', 'country', 'gpAddressOrHouseNumber', 'landmark', 'isDefault'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Update not allowed'});
        if (req.body.isDefault) {
            await Address.updateMany({user: req.user._id, _id: {$ne: req.params.id}}, {isDefault: false});
        }
        for (let key of updates) {
            address[key] = req.body[key];
        }
        await address.save();
        res.status(200).json({message: 'Address updated successfully', data: address});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({_id: req.params.id, user: req.user._id});
        if (!address)
            return res.status(404).json({message: 'Address not found'});
        res.status(200).json({message: 'Address deleted successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
