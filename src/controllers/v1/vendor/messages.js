const Message = require("./../../../models/v1/message");

exports.getMessages = async (req, res) => {
    try {
        const match = {};
        if (req.query.read !== undefined) {
            match['status'] = req.query.read === 'true' ? {$ne: 'pending'} : 'pending';
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName email phone'});
        const totalMessages = await Message.countDocuments(match);
        res.status(200).json({message: 'Messages retrieved', data: messages, count: totalMessages});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName email phone'});
        if (!message)
            return res.status(404).json({message: 'Message not found'});
        res.status(200).json({message: 'Message retrieved', data: message});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
