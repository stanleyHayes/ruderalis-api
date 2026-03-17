const Dispensary = require("./../../../models/v1/dispensary");

exports.getDispensaries = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) match['status'] = req.query.status;
        const dispensaries = await Dispensary.find(match).sort({name: 1});
        res.status(200).json({message: 'Dispensaries retrieved', data: dispensaries});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getDispensary = async (req, res) => {
    try {
        const dispensary = await Dispensary.findById(req.params.id);
        if (!dispensary) return res.status(404).json({message: 'Dispensary not found'});
        res.status(200).json({message: 'Dispensary retrieved', data: dispensary});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.createDispensary = async (req, res) => {
    try {
        const dispensary = await Dispensary.create(req.body);
        res.status(201).json({message: 'Dispensary created', data: dispensary});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateDispensary = async (req, res) => {
    try {
        const dispensary = await Dispensary.findById(req.params.id);
        if (!dispensary) return res.status(404).json({message: 'Dispensary not found'});
        const allowed = ['name', 'address', 'phone', 'manager', 'staffCount', 'status', 'licenseNo', 'licenseExpiry', 'hours', 'monthlyRevenue', 'totalOrders', 'totalProducts'];
        for (let key of Object.keys(req.body)) {
            if (allowed.includes(key)) dispensary[key] = req.body[key];
        }
        await dispensary.save();
        res.status(200).json({message: 'Dispensary updated', data: dispensary});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.deleteDispensary = async (req, res) => {
    try {
        const dispensary = await Dispensary.findById(req.params.id);
        if (!dispensary) return res.status(404).json({message: 'Dispensary not found'});
        await dispensary.deleteOne();
        res.status(200).json({message: 'Dispensary deleted'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
