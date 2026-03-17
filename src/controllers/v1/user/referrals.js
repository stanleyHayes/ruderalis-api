const Referral = require("./../../../models/v1/referral");

exports.getReferralCode = async (req, res) => {
    try {
        let referral = await Referral.findOne({referrer: req.user._id, referred: null});
        if (!referral) {
            const code = Referral.generateCode(req.user._id);
            referral = await Referral.create({referrer: req.user._id, code, reward: {type: 'fixed', value: 10, currency: 'GHS'}});
        }
        const completedCount = await Referral.countDocuments({referrer: req.user._id, status: 'completed'});
        const pendingCount = await Referral.countDocuments({referrer: req.user._id, status: 'pending', referred: {$ne: null}});
        res.status(200).json({
            message: 'Referral code retrieved',
            data: {code: referral.code, reward: referral.reward, stats: {completed: completedCount, pending: pendingCount}}
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getReferrals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;
        const match = {referrer: req.user._id, referred: {$ne: null}};
        if (req.query.status) match['status'] = req.query.status;

        const referrals = await Referral.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'referred', select: 'firstName lastName fullName email createdAt'});
        const total = await Referral.countDocuments(match);
        res.status(200).json({message: 'Referrals retrieved', data: referrals, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.applyReferralCode = async (req, res) => {
    try {
        const {code} = req.body;
        if (!code)
            return res.status(400).json({message: 'Referral code is required'});
        const referral = await Referral.findOne({code, referred: null, status: 'pending'});
        if (!referral)
            return res.status(404).json({message: 'Invalid or expired referral code'});
        if (referral.referrer.toString() === req.user._id.toString())
            return res.status(400).json({message: 'You cannot use your own referral code'});
        const alreadyReferred = await Referral.findOne({referred: req.user._id});
        if (alreadyReferred)
            return res.status(400).json({message: 'You have already used a referral code'});

        referral.referred = req.user._id;
        referral.status = 'completed';
        referral.completedAt = new Date();
        await referral.save();

        // Generate a new pending code for the referrer
        const newCode = Referral.generateCode(referral.referrer);
        await Referral.create({referrer: referral.referrer, code: newCode, reward: referral.reward});

        res.status(200).json({message: 'Referral code applied successfully', data: referral});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
