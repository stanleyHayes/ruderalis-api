const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        trim: true
    },
    number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    issuedDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expiring', 'expired', 'revoked'],
        default: 'active'
    },
    dispensary: {
        type: String,
        default: 'All',
        trim: true
    },
    authority: {
        type: String,
        required: true,
        trim: true
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const License = mongoose.model('License', licenseSchema);

module.exports = License;
