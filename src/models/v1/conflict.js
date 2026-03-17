const mongoose = require("mongoose");

const conflictSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    reason: {
        type: String,
        enum: ['wrong_item', 'damaged', 'not_delivered', 'late_delivery', 'quality_issue', 'overcharged', 'missing_items', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    evidence: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['open', 'under_review', 'awaiting_vendor', 'awaiting_customer', 'resolved', 'closed', 'escalated'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    resolution: {
        type: {
            type: String,
            enum: ['refund', 'replacement', 'partial_refund', 'store_credit', 'dismissed', 'other', '']
        },
        description: {type: String, trim: true},
        amount: {type: Number, default: 0},
        currency: {type: String, default: 'GHS'},
        resolvedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
        resolvedAt: {type: Date}
    },
    comments: [{
        user: {type: mongoose.Schema.Types.ObjectId, refPath: 'comments.userModel'},
        userModel: {type: String, enum: ['User', 'Admin'], required: true},
        text: {type: String, required: true, trim: true},
        createdAt: {type: Date, default: Date.now}
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Conflict = mongoose.model('Conflict', conflictSchema);

module.exports = Conflict;
