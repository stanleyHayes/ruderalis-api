const mongoose = require("mongoose");
const crypto = require("crypto");

const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referred: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending'
    },
    reward: {
        type: {type: String, enum: ['percentage', 'fixed'], default: 'fixed'},
        value: {type: Number, default: 0},
        currency: {type: String, default: 'GHS'}
    },
    completedAt: {
        type: Date
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

referralSchema.statics.generateCode = function (userId) {
    return `RUD-${userId.toString().slice(-4).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
