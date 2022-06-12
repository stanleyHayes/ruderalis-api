const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {type: String, trim: true, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vendor'},
    shop: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Shop'},
    status: {type: String, enum: [''], default: ''},
    stock: {
        available: {type: Boolean, default: true},
        quantity: {type: Number, min: 0}
    },
    price: {
        amount: {type: Number, required: true, min: 0},
        currency: {
            type: String,
            enum: ['GHS', 'USD', 'EUR'],
            default: 'GHS'
        }
    },
    description: {type: String, required: true, trim: true},
    image: {type: String, required: true},
    sale: {
        status: {
            type: Boolean,
            default: false
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        price: {
            amount: {
                type: Number,
                min: 0
            },
            currency: {
                type: String,
                enum: ['GHS', 'USD', 'EUR'],
                default: 'GHS'
            }
        }
    },
    rank: {
        type: Number,
        default: 1
    },
    featured: {
        status: {
            type: Boolean,
            default: false
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    metadata: {
        marijuana: {},
        edible: {},
        accessory: {}
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

productSchema.virtual('reviews', {
    justOne: false,
    localField: '_id',
    foreignField: 'product',
    ref: 'Product',
});



const Product = mongoose.model('Product', productSchema);

module.exports = Product;