const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'delivering', 'shipped', 'delivered', 'refunded'],
        default: 'pending'
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
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
                price: {
                    type: Number,
                    min: 0
                },
                status: {
                    type: String,
                    enum: ['pending', 'processing', 'completed', 'cancelled', 'delivering', 'shipped', 'delivered'],
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
    subtotal: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    },
    destination: {
        type: String
    },
    shippingAddress: {
        street: {type: String, trim: true},
        city: {type: String, trim: true},
        state: {type: String, trim: true},
        zip: {type: String, trim: true},
        country: {type: String, trim: true}
    },
    paymentMethod: {
        type: String,
        enum: ['mobile_money', 'credit_card', 'debit_card', 'cash', 'bank_transfer', ''],
        default: ''
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    notes: {
        type: String,
        trim: true
    },
    coupon: {
        code: {type: String},
        discount: {type: Number, default: 0}
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `#RUD-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
