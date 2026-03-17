const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Products', 'Orders', 'Inventory', 'Customers', 'Staff', 'Compliance', 'System', 'Promotions', 'Settings', 'Auth'],
        required: true
    },
    details: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    ip: {
        type: String,
        trim: true
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
