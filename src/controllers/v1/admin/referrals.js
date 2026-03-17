const Referral = require("../../../models/v1/referral");

const getReferrals = async (req, res) => {
    try {
        const {status, page = 1, limit = 50} = req.query;
        const filter = {};
        if (status) filter.status = status;

        const referrals = await Referral.find(filter)
            .populate('referrer', 'firstName lastName fullName email phone')
            .populate('referred', 'firstName lastName fullName email phone')
            .sort({createdAt: -1})
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Referral.countDocuments(filter);

        res.status(200).json({data: referrals, total, page: Number(page), limit: Number(limit)});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

const getReferral = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id)
            .populate('referrer', 'firstName lastName fullName email phone')
            .populate('referred', 'firstName lastName fullName email phone');

        if (!referral) return res.status(404).json({message: "Referral not found"});
        res.status(200).json({data: referral});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

const updateReferralStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const update = {status};
        if (status === 'completed') update.completedAt = new Date();

        const referral = await Referral.findByIdAndUpdate(req.params.id, update, {new: true})
            .populate('referrer', 'firstName lastName fullName email phone')
            .populate('referred', 'firstName lastName fullName email phone');

        if (!referral) return res.status(404).json({message: "Referral not found"});
        res.status(200).json({data: referral, message: "Referral status updated"});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

const getStats = async (req, res) => {
    try {
        const [total, completed, pending, topReferrers] = await Promise.all([
            Referral.countDocuments(),
            Referral.countDocuments({status: 'completed'}),
            Referral.countDocuments({status: 'pending', referred: {$ne: null}}),
            Referral.aggregate([
                {$match: {status: 'completed'}},
                {$group: {_id: '$referrer', count: {$sum: 1}, earned: {$sum: '$reward.value'}}},
                {$sort: {count: -1}},
                {$limit: 10},
                {$lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'user'}},
                {$unwind: '$user'},
                {$project: {name: '$user.fullName', email: '$user.email', referrals: '$count', earned: 1, status: '$user.status'}}
            ])
        ]);
        res.status(200).json({
            message: 'Referral stats retrieved',
            data: {total, completed, pending, conversionRate: total ? Math.round((completed / total) * 100) : 0, topReferrers}
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

module.exports = {getReferrals, getReferral, updateReferralStatus, getStats};
