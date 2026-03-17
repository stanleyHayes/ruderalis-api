const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },

    // ─── Discount Type ───────────────────────────────────
    discount: {
        type: {type: String, enum: ['percentage', 'fixed'], required: true},
        value: {type: Number, required: true, min: 0}
    },
    maxDiscount: {
        type: Number,
        default: 0 // 0 = no cap. For percentage coupons: e.g. 20% off, max GHS 50
    },
    freeShipping: {
        type: Boolean,
        default: false
    },

    // ─── Usage Limits ────────────────────────────────────
    maxUses: {
        type: Number,
        default: 0 // 0 = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    maxUsesPerUser: {
        type: Number,
        default: 1 // how many times a single user can use this coupon
    },
    usedBy: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        count: {type: Number, default: 1},
        lastUsed: {type: Date, default: Date.now}
    }],

    // ─── Order Restrictions ──────────────────────────────
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxOrderAmount: {
        type: Number,
        default: 0 // 0 = no max
    },
    minItems: {
        type: Number,
        default: 0 // minimum number of items in cart
    },

    // ─── Product / Category Restrictions ─────────────────
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableCategories: [{
        type: String,
        trim: true
    }],
    excludedCategories: [{
        type: String,
        trim: true
    }],
    applicableVariants: [{
        type: String,
        trim: true // e.g. 'flower', 'edible', 'accessory'
    }],

    // ─── Shop Restrictions ───────────────────────────────
    applicableShops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }],
    excludedShops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }],

    // ─── User Restrictions ───────────────────────────────
    applicableUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    excludedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    applicableRoles: [{
        type: String,
        enum: ['user', 'vendor']
    }],
    firstOrderOnly: {
        type: Boolean,
        default: false
    },
    newUsersOnly: {
        type: Boolean,
        default: false // users registered within last 30 days
    },

    // ─── Scheduling ──────────────────────────────────────
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

    // ─── Combinability ───────────────────────────────────
    canCombine: {
        type: Boolean,
        default: false // whether this coupon can be used with other coupons
    },

    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
