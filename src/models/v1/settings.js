const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    store: {
        name: {type: String, default: 'Ruderalis Medical'},
        email: {type: String, default: 'info@ruderalis.com'},
        phone: {type: String, default: ''},
        taxRate: {type: Number, default: 15},
        currency: {type: String, default: 'GHS'},
        timezone: {type: String, default: 'GMT'}
    },
    notifications: {
        newOrders: {type: Boolean, default: true},
        lowStock: {type: Boolean, default: true},
        licenseExpiry: {type: Boolean, default: true},
        newCustomers: {type: Boolean, default: false},
        dailySummary: {type: Boolean, default: true},
        staffActivity: {type: Boolean, default: false},
        systemUpdates: {type: Boolean, default: true}
    },
    shop: {
        create: {},
        daily: {},
        monthly: {}
    },
    product: {
        create: {},
        daily: {},
        monthly: {}
    },
    account: {
        vendor: {},
        user: {}
    },
    promotion: {
        shop: {day: {}, month: {}, year: {}},
        product: {day: {}, month: {}, year: {}}
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
