const User = require("./../../../models/v1/user");

exports.getUsers = async (req, res) => {
    try {
        const match = {};
        if (req.query.status) {
            match['status'] = req.query.status;
        }
        if (req.query.role) {
            match['role'] = req.query.role;
        }
        if (req.query.query) {
            match['$or'] = [
                {firstName: {$regex: req.query.query, $options: 'i'}},
                {lastName: {$regex: req.query.query, $options: 'i'}},
                {fullName: {$regex: req.query.query, $options: 'i'}},
                {username: {$regex: req.query.query, $options: 'i'}},
                {email: {$regex: req.query.query, $options: 'i'}},
                {phone: {$regex: req.query.query, $options: 'i'}}
            ];
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find(match)
            .select('-password -pin -devices -passwords -authInfo')
            .skip(skip).limit(limit).sort({createdAt: -1});
        const totalUsers = await User.countDocuments(match);
        res.status(200).json({message: 'Users retrieved successfully', data: users, count: totalUsers});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -pin -devices -passwords -authInfo');
        if (!user)
            return res.status(404).json({message: 'User not found'});
        res.status(200).json({message: 'User retrieved successfully', data: user});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateUserStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const allowedStatuses = ['active', 'suspended', 'frozen', 'deleted'];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({message: 'Invalid status'});
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({message: 'User not found'});
        user.status = status;
        await user.save();
        res.status(200).json({message: `User status updated to ${status}`, data: user});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateUserPermissions = async (req, res) => {
    try {
        const {permissions} = req.body;
        if (!permissions)
            return res.status(400).json({message: 'Permissions are required'});
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({message: 'User not found'});
        const allowedEntities = Object.keys(user.permissions.toObject());
        for (let entity of Object.keys(permissions)) {
            if (!allowedEntities.includes(entity))
                return res.status(400).json({message: `Invalid permission entity: ${entity}`});
            for (let action of Object.keys(permissions[entity])) {
                if (user.permissions[entity][action] !== undefined) {
                    user.permissions[entity][action] = permissions[entity][action];
                }
            }
        }
        await user.save();
        res.status(200).json({message: 'User permissions updated successfully', data: user});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
