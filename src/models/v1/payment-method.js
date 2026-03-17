const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['mobile_money', 'credit_card', 'debit_card', 'bank_transfer'],
        required: true
    },
    provider: {
        type: String,
        trim: true
    },
    number: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
