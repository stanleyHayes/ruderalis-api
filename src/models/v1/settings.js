const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    shop: {
        create: {},
        daily: {},
        monthly: {},
    },
    product: {
        create: {},
        daily: {},
        monthly: {},
    },
    account: {
        vendor: {},
        user: {}
    },
    promotion: {
        shop: {
            day: {},
            month: {},
            year: {}
        },
        product: {
            day: {},
            month: {},
            year: {}
        }
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;

