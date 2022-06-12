const mongoose = require("mongoose");

const shopVisitSchema = new mongoose.Schema({
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const ShopVisit = mongoose.model('ShopVisit', shopVisitSchema);

module.exports = ShopVisit;