const License = require("./../../../models/v1/license");

exports.getCompliance = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000);

        const licenses = await License.find().sort({expiryDate: 1});

        // Auto-update statuses
        for (const lic of licenses) {
            if (lic.expiryDate < now && lic.status !== 'expired') {
                lic.status = 'expired';
                await lic.save();
            } else if (lic.expiryDate < thirtyDaysFromNow && lic.expiryDate >= now && lic.status === 'active') {
                lic.status = 'expiring';
                await lic.save();
            }
        }

        const activeLicenses = licenses.filter(l => l.status === 'active').length;
        const expiringSoon = licenses.filter(l => l.status === 'expiring').length;

        // Compliance checklist (can be extended to its own model later)
        const checklist = [
            {item: 'Monthly inventory audit', status: 'completed', date: new Date(now.getFullYear(), now.getMonth(), 13).toISOString()},
            {item: 'Security camera inspection', status: 'completed', date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString()},
            {item: 'Patient record audit', status: 'pending', date: new Date(now.getFullYear(), now.getMonth(), 20).toISOString()},
            {item: 'DEA registration renewal', status: 'pending', date: new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString()},
            {item: 'Staff training certification', status: 'completed', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString()},
            {item: 'Fire safety inspection', status: 'pending', date: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString()},
        ];

        res.status(200).json({
            message: 'Compliance data retrieved',
            data: {
                licenses,
                checklist,
                stats: {
                    activeLicenses,
                    expiringSoon,
                    totalLicenses: licenses.length,
                    complianceScore: Math.round((activeLicenses / (licenses.length || 1)) * 100)
                }
            }
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getLicenses = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) match['status'] = req.query.status;
        const licenses = await License.find(match).sort({expiryDate: 1});
        res.status(200).json({message: 'Licenses retrieved', data: licenses});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.createLicense = async (req, res) => {
    try {
        const license = await License.create(req.body);
        res.status(201).json({message: 'License created', data: license});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateLicense = async (req, res) => {
    try {
        const license = await License.findById(req.params.id);
        if (!license) return res.status(404).json({message: 'License not found'});
        const allowed = ['type', 'number', 'issuedDate', 'expiryDate', 'status', 'dispensary', 'authority'];
        for (let key of Object.keys(req.body)) {
            if (allowed.includes(key)) license[key] = req.body[key];
        }
        await license.save();
        res.status(200).json({message: 'License updated', data: license});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.deleteLicense = async (req, res) => {
    try {
        const license = await License.findById(req.params.id);
        if (!license) return res.status(404).json({message: 'License not found'});
        await license.deleteOne();
        res.status(200).json({message: 'License deleted'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
