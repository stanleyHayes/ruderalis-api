const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied'],
        default: 'pending'
    },
    reply: {
        text: {type: String, trim: true},
        admin: {type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
        repliedAt: {type: Date}
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
