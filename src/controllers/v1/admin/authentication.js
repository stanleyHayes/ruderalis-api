const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const otpGenerator = require("otp-generator");

const Admin = require("./../../../models/v1/admin");
const keys = require("./../../../config/keys");
const { sendEmail } = require("../../../utils/emails");


exports.register = async (req, res) => {
    try {
        const { username, password, phone, firstName, lastName, pin, email, role } = req.body;
        if (!username || !password || !phone || !firstName || !pin || !lastName || !email)
            return res.status(400).json({ message: 'Missing required fields' });
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { phone }, { email }] });
        if (existingAdmin)
            return res.status(409).json({ message: 'Username or phone or email already taken' });
        const token = jwt.sign({ username }, keys.jwtSecret, { expiresIn: '48h' }, null);
        const otp = otpGenerator.generate(
            parseInt(keys.otpLength), {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            digits: true,
            specialChars: false
        });

        const message = `Your admin account verification OTP is ${otp}. OTP expires after 48 hours`;
        const subject = `Verify Admin Account`;
        await sendEmail(email, subject, message);
        await Admin.create({
            username,
            firstName,
            lastName,
            phone,
            email,
            role: role || 'admin',
            password: await bcrypt.hash(password, 10),
            pin: await bcrypt.hash(pin, 10),
            fullName: `${firstName} ${lastName}`,
            authInfo: {
                otp,
                expiryDate: moment().add(48, 'hours'),
                token
            }
        });
        res.status(201).json({ message: 'Admin account created successfully. Check your email to verify your account.' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.login = async (req, res) => {
    try {
        const { usernameOrEmailOrPhone, password } = req.body;
        const existingAdmin = await Admin.findOne({
            $or: [
                { username: usernameOrEmailOrPhone },
                { email: usernameOrEmailOrPhone },
                { phone: usernameOrEmailOrPhone }
            ]
        });
        if (!existingAdmin)
            return res.status(401).json({ message: 'Auth Failed' });
        if (!await bcrypt.compare(password, existingAdmin.password))
            return res.status(401).json({ message: 'Auth Failed' });
        if (existingAdmin.status === 'pending')
            return res.status(400).json({ message: 'Please verify your account' });

        const token = jwt.sign(
            { _id: existingAdmin._id.toString() },
            keys.jwtSecret,
            { expiresIn: '24h' },
            null
        );

        existingAdmin.authInfo = {};
        existingAdmin.devices = existingAdmin.devices.concat({
            token,
            ip: req.useragent?.ip,
            browser: req.useragent?.browser,
            source: req.useragent?.source,
            os: req.useragent?.os,
            isMobile: req.useragent?.isMobile,
            isDesktop: req.useragent?.isDesktop,
            platform: req.useragent?.platform
        });
        await existingAdmin.save();
        res.status(200).json({ message: 'Login successful', data: existingAdmin, token });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.verifyLoginOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const { token } = req.params;
        const decoded = await jwt.verify(token, keys.jwtSecret, null, null);
        const admin = await Admin.findOne({ "authInfo.token": token, _id: decoded._id });
        if (!admin)
            return res.status(401).json({ message: 'Auth failed' });
        if (moment().isAfter(admin.authInfo.expiryDate))
            return res.status(401).json({ message: 'OTP has expired' });
        if (otp !== admin.authInfo.otp)
            return res.status(401).json({ message: 'Incorrect OTP' });

        admin.authInfo = {};

        const loginToken = jwt.sign(
            { _id: admin._id.toString() },
            keys.jwtSecret,
            { expiresIn: '24h' },
            null
        );

        admin.devices = admin.devices.concat({
            token: loginToken,
            ip: req.useragent.ip,
            browser: req.useragent.browser,
            source: req.useragent.source,
            os: req.useragent.os,
            isMobile: req.useragent.isMobile,
            isDesktop: req.useragent.isDesktop,
            platform: req.useragent.platform
        });

        await admin.save();
        res.status(200).json({ message: 'OTP verified successfully', data: admin, token: loginToken });
    } catch (e) {
        res.status(500).json({ message: 'OTP Expired. Please login again' });
    }
}


exports.getProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: 'Profile retrieved successfully',
            data: req.admin,
            token: req.token
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.updateProfile = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'username', 'phone'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({ message: 'Update not allowed' });
        for (let key of updates) {
            if (key === 'username') {
                const existing = await Admin.findOne({ username: req.body[key] });
                if (existing)
                    return res.status(409).json({ message: 'Username already taken' });
            }
            if (key === 'phone') {
                const existing = await Admin.findOne({ phone: req.body[key] });
                if (existing)
                    return res.status(409).json({ message: 'Phone number already taken' });
            }
            req.admin[key] = req.body[key];
        }
        if (req.body.firstName || req.body.lastName) {
            req.admin.fullName = `${req.admin.firstName} ${req.admin.lastName}`;
        }
        await req.admin.save();
        res.status(200).json({ message: 'Profile updated successfully', data: req.admin });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, password } = req.body;
        if (!await bcrypt.compare(currentPassword, req.admin.password))
            return res.status(401).json({ message: 'Incorrect password' });
        req.admin.password = await bcrypt.hash(password, 10);
        req.admin.passwords = req.admin.passwords.concat({
            password: req.admin.password,
            updatedAt: Date.now()
        });
        await req.admin.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.changePin = async (req, res) => {
    try {
        const { currentPin, pin } = req.body;
        if (!await bcrypt.compare(currentPin, req.admin.pin))
            return res.status(401).json({ message: 'Incorrect Pin' });
        req.admin.pin = await bcrypt.hash(pin, 10);
        await req.admin.save();
        res.status(200).json({ message: 'Pin changed successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { password } = req.body;
        jwt.verify(token, keys.jwtSecret, null, null);
        const admin = await Admin.findOne({ "authInfo.token": token });
        if (!admin)
            return res.status(404).json({ message: 'Admin not found' });
        admin.password = await bcrypt.hash(password, 10);
        await admin.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
}


exports.resetPin = async (req, res) => {
    try {
        const { token } = req.query;
        const { pin } = req.body;
        jwt.verify(token, keys.jwtSecret, null, null);
        const admin = await Admin.findOne({ "authInfo.token": token });
        if (!admin)
            return res.status(404).json({ message: 'Admin not found' });
        admin.pin = await bcrypt.hash(pin, 10);
        await admin.save();
        res.status(200).json({ message: 'Pin changed successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.logout = async (req, res) => {
    try {
        req.admin.devices = req.admin.devices.filter(device => device.token !== req.token);
        await req.admin.save();
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.logoutAll = async (req, res) => {
    try {
        req.admin.devices = [];
        await req.admin.save();
        res.status(200).json({ message: 'Successfully logged out of all devices' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.verifyProfile = async (req, res) => {
    try {
        const { token } = req.params;
        const { otp } = req.body;
        if (!otp)
            return res.status(400).json({ message: 'Missing required field otp' });
        const admin = await Admin.findOne(
            { $and: [{ "authInfo.token": token }, { "authInfo.otp": otp }] }
        );
        if (!admin)
            return res.status(401).json({ message: 'Incorrect otp' });
        if (moment().isAfter(admin.authInfo.expiryDate))
            return res.status(400).json({ message: 'Token expired' });
        admin.status = 'active';
        admin.authInfo = {};
        await admin.save();
        res.status(200).json({ message: 'Profile verified successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}


exports.resendOTP = async (req, res) => {
    try {
        const { usernameOrEmailOrPhone } = req.body;
        const existingAdmin = await Admin.findOne({
            $or: [
                { username: usernameOrEmailOrPhone },
                { email: usernameOrEmailOrPhone },
                { phone: usernameOrEmailOrPhone }
            ]
        });
        if (!existingAdmin)
            return res.status(404).json({ message: 'No admin associated with the provided credentials' });
        const otp = otpGenerator.generate(parseInt(keys.otpLength), {
            digits: true,
            lowerCaseAlphabets: false,
            specialChars: false,
            upperCaseAlphabets: false
        });
        const token = jwt.sign(
            { _id: existingAdmin._id.toString() },
            keys.jwtSecret,
            { expiresIn: '1h' },
            null
        );
        existingAdmin.authInfo = {
            otp,
            expiryDate: moment().add(1, 'hour'),
            token
        }
        await existingAdmin.save();
        const message = `Your OTP is ${otp}. OTP expires in 1 hour`;
        const subject = `Ruderalis Admin OTP`;
        await sendEmail(existingAdmin.email, subject, message);
        res.status(200).json({ message: 'OTP sent successfully', token });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}
