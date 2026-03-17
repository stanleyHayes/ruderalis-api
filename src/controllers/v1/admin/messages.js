const Message = require("./../../../models/v1/message");

exports.getMessages = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.user) {
            match['user'] = req.query.user;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName email phone'});
        const totalMessages = await Message.countDocuments(match);
        res.status(200).json({message: 'Messages retrieved successfully', data: messages, count: totalMessages});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName email phone'})
            .populate({path: 'reply.admin', select: 'firstName lastName fullName'});
        if (!message)
            return res.status(404).json({message: 'Message not found'});
        if (message.status === 'pending') {
            message.status = 'read';
            await message.save();
        }
        res.status(200).json({message: 'Message retrieved successfully', data: message});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.replyMessage = async (req, res) => {
    try {
        const {text} = req.body;
        if (!text)
            return res.status(400).json({message: 'Reply text is required'});
        const message = await Message.findById(req.params.id);
        if (!message)
            return res.status(404).json({message: 'Message not found'});
        message.reply = {
            text,
            admin: req.admin._id,
            repliedAt: new Date()
        };
        message.status = 'replied';
        await message.save();
        await message.populate({path: 'reply.admin', select: 'firstName lastName fullName'});
        res.status(200).json({message: 'Reply sent successfully', data: message});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
