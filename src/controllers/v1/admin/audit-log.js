const AuditLog = require("./../../../models/v1/audit-log");

exports.getAuditLogs = async (req, res) => {
    try {
        const match = {};
        if (req.query.category) match['category'] = req.query.category;
        if (req.query.action) match['action'] = {$regex: req.query.action, $options: 'i'};
        if (req.query.user) match['user'] = req.query.user;
        if (req.query.startDate || req.query.endDate) {
            match['createdAt'] = {};
            if (req.query.startDate) match['createdAt']['$gte'] = new Date(req.query.startDate);
            if (req.query.endDate) match['createdAt']['$lte'] = new Date(req.query.endDate);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName'});
        const total = await AuditLog.countDocuments(match);
        res.status(200).json({message: 'Audit logs retrieved', data: logs, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getAuditLog = async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName'});
        if (!log) return res.status(404).json({message: 'Audit log not found'});
        res.status(200).json({message: 'Audit log retrieved', data: log});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
