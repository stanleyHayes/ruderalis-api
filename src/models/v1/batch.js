const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    supplier: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    remaining: {
        type: Number,
        required: true,
        min: 0
    },
    receivedDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    labTested: {
        type: Boolean,
        default: false
    },
    testDate: {
        type: Date
    },
    thc: {
        type: Number,
        default: 0
    },
    cbd: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'low_stock', 'depleted', 'expired'],
        default: 'active'
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
