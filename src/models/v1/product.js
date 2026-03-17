const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {type: String, trim: true, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    shop: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Shop'},
    status: {
        type: String,
        enum: ['active', 'deleted', 'pending'],
        default: 'pending'
    },
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
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        },
        details: {
            five: {
                type: Number,
                default: 0
            },
            four: {
                type: Number,
                default: 0
            },
            three: {
                type: Number,
                default: 0
            },
            two: {
                type: Number,
                default: 0
            },
            one: {
                type: Number,
                default: 0
            }
        }
    },
    variant: {
        type: String,
        enum: ['marijuana', 'edible', 'accessory', 'flower', 'concentrate', 'topical', 'pre-roll', 'tincture', 'vape'],
        required: true
    },
    category: {
        type: String,
        trim: true
    },
    strain: {
        type: String,
        enum: ['sativa', 'indica', 'hybrid', 'cbd', ''],
        default: ''
    },
    thc: {
        type: Number,
        default: 0
    },
    cbd: {
        type: Number,
        default: 0
    },
    weight: {
        type: String,
        trim: true
    },
    sku: {
        type: String,
        trim: true
    },
    tags: [{type: String, trim: true}]
}, {
    timestamps: {createdAt: true, updatedAt: true},
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

productSchema.virtual('reviews', {
    justOne: false,
    localField: '_id',
    foreignField: 'product',
    ref: 'Review',
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;