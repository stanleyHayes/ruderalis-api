const Settings = require("./../../../models/v1/settings");

const DEFAULT_SETTINGS = {
    store: {
        name: 'Ruderalis Medical',
        email: 'info@ruderalis.com',
        phone: '+233541000001',
        taxRate: 15.00,
        currency: 'GHS',
        timezone: 'GMT'
    },
    notifications: {
        newOrders: true,
        lowStock: true,
        licenseExpiry: true,
        newCustomers: false,
        dailySummary: true,
        staffActivity: false,
        systemUpdates: true
    }
};

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(DEFAULT_SETTINGS);
        }
        res.status(200).json({message: 'Settings retrieved', data: settings});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(DEFAULT_SETTINGS);
        }
        const allowed = ['store', 'notifications', 'shop', 'product', 'account', 'promotion'];
        for (let key of Object.keys(req.body)) {
            if (allowed.includes(key)) {
                if (typeof req.body[key] === 'object' && settings[key]) {
                    Object.assign(settings[key], req.body[key]);
                } else {
                    settings[key] = req.body[key];
                }
            }
        }
        settings.markModified('store');
        settings.markModified('notifications');
        await settings.save();
        res.status(200).json({message: 'Settings updated', data: settings});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
