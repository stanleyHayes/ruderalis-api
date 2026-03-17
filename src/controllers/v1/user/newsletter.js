const Newsletter = require("./../../../models/v1/newsletter");

exports.subscribe = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email)
            return res.status(400).json({message: 'Email is required'});
        const existing = await Newsletter.findOne({email: email.toLowerCase()});
        if (existing) {
            if (existing.active)
                return res.status(409).json({message: 'Already subscribed'});
            existing.active = true;
            await existing.save();
            return res.status(200).json({message: 'Re-subscribed successfully'});
        }
        await Newsletter.create({email});
        res.status(201).json({message: 'Subscribed successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.unsubscribe = async (req, res) => {
    try {
        const {email} = req.body;
        const sub = await Newsletter.findOne({email: email.toLowerCase()});
        if (!sub)
            return res.status(404).json({message: 'Subscription not found'});
        sub.active = false;
        await sub.save();
        res.status(200).json({message: 'Unsubscribed successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
