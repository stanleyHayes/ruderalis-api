const mongoose = require("mongoose");

const dispensarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    manager: {
        type: String,
        trim: true
    },
    staffCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'closed'],
        default: 'active'
    },
    licenseNo: {
        type: String,
        trim: true
    },
    licenseExpiry: {
        type: Date
    },
    hours: {
        type: String,
        trim: true
    },
    monthlyRevenue: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalProducts: {
        type: Number,
        default: 0
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Dispensary = mongoose.model('Dispensary', dispensarySchema);

module.exports = Dispensary;
