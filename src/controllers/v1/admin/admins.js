const bcrypt = require("bcryptjs");
const Admin = require("./../../../models/v1/admin");

exports.getAdmins = async (req, res) => {
    try {
        if (req.admin.role !== 'super-admin')
            return res.status(403).json({message: 'Only super admins can manage admins'});
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.role) {
            match['role'] = req.query.role;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const admins = await Admin.find(match)
            .select('-password -pin -devices -passwords -authInfo')
            .skip(skip).limit(limit).sort({createdAt: -1});
        const totalAdmins = await Admin.countDocuments(match);
        res.status(200).json({message: 'Admins retrieved successfully', data: admins, count: totalAdmins});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'super-admin')
            return res.status(403).json({message: 'Only super admins can manage admins'});
        const admin = await Admin.findById(req.params.id)
            .select('-password -pin -devices -passwords -authInfo');
        if (!admin)
            return res.status(404).json({message: 'Admin not found'});
        res.status(200).json({message: 'Admin retrieved successfully', data: admin});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'super-admin')
            return res.status(403).json({message: 'Only super admins can manage admins'});
        const admin = await Admin.findById(req.params.id);
        if (!admin)
            return res.status(404).json({message: 'Admin not found'});
        const updates = Object.keys(req.body);
        const allowedUpdates = ['status', 'role', 'permissions'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Update not allowed'});
        for (let key of updates) {
            if (key === 'permissions') {
                for (let entity of Object.keys(req.body.permissions)) {
                    for (let action of Object.keys(req.body.permissions[entity])) {
                        if (admin.permissions[entity] && admin.permissions[entity][action] !== undefined) {
                            admin.permissions[entity][action] = req.body.permissions[entity][action];
                        }
                    }
                }
            } else {
                admin[key] = req.body[key];
            }
        }
        await admin.save();
        res.status(200).json({message: 'Admin updated successfully', data: admin});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'super-admin')
            return res.status(403).json({message: 'Only super admins can manage admins'});
        const admin = await Admin.findById(req.params.id);
        if (!admin)
            return res.status(404).json({message: 'Admin not found'});
        if (admin._id.toString() === req.admin._id.toString())
            return res.status(400).json({message: 'You cannot delete your own account'});
        admin.status = 'deleted';
        await admin.save();
        res.status(200).json({message: 'Admin deleted successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
