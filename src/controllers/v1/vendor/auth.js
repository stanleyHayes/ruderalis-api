const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const otpGenerator = require("otp-generator");

const User = require("./../../../models/v1/user");
const keys = require("./../../../config/keys");
const {sendEmail} = require("../../../utils/emails");


exports.register = async (req, res) => {
    try {
        const {username, password, phone, firstName, lastName, pin, email} = req.body;
        if (!username || !password || !phone || !firstName || !pin || !lastName || !email)
            return res.status(400).json({message: 'Missing required fields'});
        const existingUser = await User.findOne({$or: [{username}, {phone}, {email}]});
        if (existingUser)
            return res.status(409).json({message: 'Username or phone or email already taken'});
        const token = jwt.sign({username}, keys.jwtSecret, {expiresIn: '48h'}, null);
        const otp = otpGenerator.generate(parseInt(keys.otpLength), {
            lowerCaseAlphabets: false, upperCaseAlphabets: false, digits: true, specialChars: false
        });
        const message = `Your vendor account verification OTP is ${otp}. OTP expires after 48 hours`;
        await sendEmail(email, 'Verify Vendor Account', message);
        await User.create({
            username, firstName, lastName, phone, email,
            role: 'vendor',
            password: await bcrypt.hash(password, 10),
            pin: await bcrypt.hash(pin, 10),
            fullName: `${firstName} ${lastName}`,
            authInfo: {otp, expiryDate: moment().add(48, 'hours'), token}
        });
        res.status(201).json({message: 'Vendor account created successfully. Check your email to verify.'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.login = async (req, res) => {
    try {
        const {usernameOrEmailOrPhone, password} = req.body;
        const user = await User.findOne({
            role: 'vendor',
            $or: [{username: usernameOrEmailOrPhone}, {email: usernameOrEmailOrPhone}, {phone: usernameOrEmailOrPhone}]
        });
        if (!user)
            return res.status(401).json({message: 'Auth Failed'});
        if (!await bcrypt.compare(password, user.password))
            return res.status(401).json({message: 'Auth Failed'});
        if (user.status === 'pending')
            return res.status(400).json({message: 'Please verify your account'});
        const otp = otpGenerator.generate(parseInt(keys.otpLength), {
            digits: true, lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false
        });
        const token = jwt.sign({_id: user._id.toString()}, keys.jwtSecret, {expiresIn: '1h'}, null);
        user.authInfo = {otp, expiryDate: moment().add(1, 'hours'), token};
        await user.save();
        const message = `Your vendor OTP is ${otp}. OTP expires in 1 hour.`;
        // await sendEmail(user.email, 'Ruderalis Vendor OTP', message);
        res.status(200).json({message: 'Check your email to verify otp.', token});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.verifyLoginOTP = async (req, res) => {
    try {
        const {otp} = req.body;
        const {token} = req.params;
        const decoded = await jwt.verify(token, keys.jwtSecret, null, null);
        const user = await User.findOne({"authInfo.token": token, _id: decoded._id, role: 'vendor'});
        if (!user)
            return res.status(401).json({message: 'Auth failed'});
        if (moment().isAfter(user.authInfo.expiryDate))
            return res.status(401).json({message: 'OTP has expired'});
        if (otp !== user.authInfo.otp)
            return res.status(401).json({message: 'Incorrect OTP'});
        user.authInfo = {};
        const loginToken = jwt.sign({_id: user._id.toString()}, keys.jwtSecret, {expiresIn: '24h'}, null);
        user.devices = user.devices.concat({
            token: loginToken, ip: req.useragent.ip, browser: req.useragent.browser,
            source: req.useragent.source, os: req.useragent.os,
            isMobile: req.useragent.isMobile, isDesktop: req.useragent.isDesktop, platform: req.useragent.platform
        });
        await user.save();
        res.status(200).json({message: 'OTP verified successfully', data: user, token: loginToken});
    } catch (e) {
        res.status(500).json({message: 'OTP Expired. Please login again'});
    }
}


exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email, role: 'vendor'});
        if (!user)
            return res.status(404).json({message: 'No vendor account found with this email'});
        const token = jwt.sign({_id: user._id.toString()}, keys.jwtSecret, {expiresIn: '1h'}, null);
        user.authInfo = {token, expiryDate: moment().add(1, 'hour')};
        await user.save();
        const message = `Use this token to reset your password: ${token}`;
        await sendEmail(user.email, 'Reset Password', message);
        res.status(200).json({message: 'Password reset link sent to email', token});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.resetPassword = async (req, res) => {
    try {
        const {token, password} = req.body;
        if (!token || !password)
            return res.status(400).json({message: 'Token and password are required'});
        jwt.verify(token, keys.jwtSecret, null, null);
        const user = await User.findOne({"authInfo.token": token});
        if (!user)
            return res.status(404).json({message: 'Invalid or expired token'});
        user.password = await bcrypt.hash(password, 10);
        user.authInfo = {};
        await user.save();
        res.status(200).json({message: 'Password reset successfully'});
    } catch (e) {
        res.status(401).json({message: 'Invalid or expired token'});
    }
}


exports.getProfile = async (req, res) => {
    try {
        res.status(200).json({message: 'Profile retrieved successfully', data: req.user, token: req.token});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateProfile = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'username', 'phone', 'address'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Update not allowed'});
        for (let key of updates) {
            req.user[key] = req.body[key];
        }
        if (req.body.firstName || req.body.lastName) {
            req.user.fullName = `${req.user.firstName} ${req.user.lastName}`;
        }
        await req.user.save();
        res.status(200).json({message: 'Profile updated successfully', data: req.user});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.changePassword = async (req, res) => {
    try {
        const {currentPassword, password} = req.body;
        if (!await bcrypt.compare(currentPassword, req.user.password))
            return res.status(401).json({message: 'Incorrect password'});
        req.user.password = await bcrypt.hash(password, 10);
        await req.user.save();
        res.status(200).json({message: 'Password changed successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.verifyEmail = async (req, res) => {
    try {
        const {token} = req.params;
        const {otp} = req.body;
        const user = await User.findOne({$and: [{"authInfo.token": token}, {"authInfo.otp": otp}]});
        if (!user)
            return res.status(401).json({message: 'Incorrect otp'});
        if (moment().isAfter(user.authInfo.expiryDate))
            return res.status(400).json({message: 'Token expired'});
        user.status = 'active';
        user.authInfo = {};
        await user.save();
        res.status(200).json({message: 'Account verified successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteAccount = async (req, res) => {
    try {
        req.user.status = 'deleted';
        await req.user.save();
        res.status(200).json({message: 'Account deleted successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.logout = async (req, res) => {
    try {
        req.user.devices = req.user.devices.filter(device => device.token !== req.token);
        await req.user.save();
        res.status(200).json({message: 'Logged out successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.resendOTP = async (req, res) => {
    try {
        const {usernameOrEmailOrPhone} = req.body;
        const user = await User.findOne({
            role: 'vendor',
            $or: [{username: usernameOrEmailOrPhone}, {email: usernameOrEmailOrPhone}, {phone: usernameOrEmailOrPhone}]
        });
        if (!user)
            return res.status(404).json({message: 'No vendor account found'});
        const otp = otpGenerator.generate(parseInt(keys.otpLength), {
            digits: true, lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false
        });
        const token = jwt.sign({_id: user._id.toString()}, keys.jwtSecret, {expiresIn: '1h'}, null);
        user.authInfo = {otp, expiryDate: moment().add(1, 'hour'), token};
        await user.save();
        await sendEmail(user.email, 'Ruderalis Vendor OTP', `Your OTP is ${otp}. Expires in 1 hour.`);
        res.status(200).json({message: 'OTP sent successfully', token});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
