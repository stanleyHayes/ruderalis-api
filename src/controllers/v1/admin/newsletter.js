const Newsletter = require("./../../../models/v1/newsletter");

exports.getSubscribers = async (req, res) => {
    try {
        const match = {};
        if (req.query.active !== undefined) match['active'] = req.query.active === 'true';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;
        const subscribers = await Newsletter.find(match).skip(skip).limit(limit).sort({createdAt: -1});
        const total = await Newsletter.countDocuments(match);
        res.status(200).json({message: 'Subscribers retrieved', data: subscribers, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
