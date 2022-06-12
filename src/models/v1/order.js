const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'delivering'],
        default: 'pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    min: 0,
                    required: true
                },
                status: {
                    type: String,
                    enum: ['pending', 'completed', 'cancelled', 'delivering'],
                    default: 'pending'
                }
            }
        ]
    },
    price: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'GHS',
            enum: ['GHS', 'USD', 'EUR']
        }
    },
    destination: {
        type: String,
        required: true
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;