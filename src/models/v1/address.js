const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    label: {
        type: String,
        trim: true,
        default: 'Home'
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    region: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    gpAddressOrHouseNumber: {
        type: String,
        trim: true
    },
    landmark: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
