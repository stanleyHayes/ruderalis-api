const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const validator = require("validator");


const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    contact: {
        phone: {
            type: String,
            required: true,
            trim: true,
            validate(value){
                if(!validator.isMobilePhone(value)){
                    throw new Error(`Invalid phone number`);
                }
            },
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error(`Invalid phone`);
                }
            },
        }
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'suspended', 'frozen', 'deleted', 'active'],
        default: 'pending'
    },
    image: {type: String, required: true},
    rank: {
        type: Number,
        default: 10
    },
    featured: {
        value: {
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
    destinations: {
        type: [
            {
                name: {type: String, required: true},
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
                }
            }
        ]
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
}, {
    timestamps: {createdAt: true, updatedAt: true},
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

shopSchema.virtual('reviews', {
    justOne: false,
    localField: '_id',
    foreignField: 'shop',
    ref: 'ShopReview',
});

shopSchema.virtual('products', {
    justOne: false,
    localField: '_id',
    foreignField: 'shop',
    ref: 'Product',
});

shopSchema.virtual('productCount', {
    justOne: false,
    localField: '_id',
    foreignField: 'shop',
    ref: 'Product',
    count: true
});


shopSchema.virtual('featuredProducts', {
    justOne: false,
    localField: '_id',
    foreignField: 'shop',
    ref: 'Product',
    match: shop => {
        return {"featured.status": true, shop: shop._id}
    }
});


shopSchema.virtual('onSaleProducts', {
    justOne: false,
    localField: '_id',
    foreignField: 'shop',
    ref: 'Product',
    match: shop => {
        return {"sale.status": true, shop: shop._id}
    }
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;