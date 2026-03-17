const Message = require("./../../../models/v1/message");
const {checkPermission} = require("../../../utils/check-permission");

exports.createMessage = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'message', 'create'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const {subject, text} = req.body;
        if (!subject || !text)
            return res.status(400).json({message: 'Subject and text are required'});
        const message = await Message.create({
            user: req.user._id, subject, text
        });
        res.status(201).json({message: 'Message sent successfully', data: message});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getMessage = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'message', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const message = await Message.findOne({_id: req.params.id, user: req.user._id})
            .populate({path: 'reply.admin', select: 'firstName lastName fullName'});
        if (!message)
            return res.status(404).json({message: 'Message not found'});
        res.status(200).json({message: 'Message retrieved successfully', data: message});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getMessages = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'message', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const match = {user: req.user._id};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'reply.admin', select: 'firstName lastName fullName'});
        const totalMessages = await Message.countDocuments(match);
        res.status(200).json({message: 'Messages retrieved successfully', data: messages, count: totalMessages});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
