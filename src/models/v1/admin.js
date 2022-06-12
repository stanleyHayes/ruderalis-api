const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({

}, {timestamps: {createdAt: true, updatedAt: true}});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;