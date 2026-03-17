const Batch = require("./../../../models/v1/batch");

exports.getBatches = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) match['status'] = req.query.status;
        if (req.query.product) match['product'] = req.query.product;
        if (req.query.supplier) match['supplier'] = {$regex: req.query.supplier, $options: 'i'};
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const batches = await Batch.find(match)
            .skip(skip).limit(limit).sort({receivedDate: -1})
            .populate({path: 'product', select: 'name variant category'});
        const total = await Batch.countDocuments(match);
        res.status(200).json({message: 'Batches retrieved', data: batches, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate({path: 'product'});
        if (!batch) return res.status(404).json({message: 'Batch not found'});
        res.status(200).json({message: 'Batch retrieved', data: batch});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.createBatch = async (req, res) => {
    try {
        const batch = await Batch.create(req.body);
        res.status(201).json({message: 'Batch created', data: batch});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({message: 'Batch not found'});
        const allowed = ['remaining', 'status', 'labTested', 'testDate', 'thc', 'cbd', 'expiryDate'];
        for (let key of Object.keys(req.body)) {
            if (allowed.includes(key)) batch[key] = req.body[key];
        }
        await batch.save();
        res.status(200).json({message: 'Batch updated', data: batch});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({message: 'Batch not found'});
        await batch.deleteOne();
        res.status(200).json({message: 'Batch deleted'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
