const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
    item: {
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop'
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    variant: {
        type: String,
        enum: ['shop', 'product'],
        required: true
    },
    rank: {
        type: Number,
        required: true
    },
    price: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            enum: ['GHS', 'USD', 'EUR'],
            default: 'GHS'
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    duration: {
        amount: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['day', 'month', 'year']
        }
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired'],
        default: 'pending'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;