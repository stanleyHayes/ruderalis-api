const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        price: {
            amount: {
                type: Number,
                min: 0,
                required: true
            },
            currency: {
                type: String,
                enum: ['GHS', 'USD', 'EUR'],
                default: 'GHS'
            }
        },
        method: {
            type: String,
            enum: ['mobile money'],
            default: 'mobile money'
        },
        status: {
            type: String,
            enum: ['pending', 'failed', 'success'],
            default: 'pending'
        },
        sender: {
            provider: {
                type: String,
                enum: ['mtn', 'vodafone', 'airtelTigo'],
                required: true
            },
            number: {
                type: String,
                required: true
            }
        },
        recipient: {
            provider: {
                type: String,
                enum: ['mtn', 'vodafone', 'airtelTigo'],
                required: true
            },
            number: {
                type: String,
                required: true
            }
        },
        transactionID: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            enum: ['product-promotion', 'store-promotion', 'daily-payment', 'monthly-payment', 'store-setup', 'product-setup'],
            required: true
        }
    },
    {
        timestamps: {createdAt: true, updatedAt: true},
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;