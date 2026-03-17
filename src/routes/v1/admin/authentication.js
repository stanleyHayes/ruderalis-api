const express = require("express");
const {
    register, login, verifyLoginOTP, getProfile, updateProfile,
    changePassword, changePin, resetPassword, resetPin,
    logout, logoutAll, verifyProfile, resendOTP
} = require("../../../controllers/v1/admin/authentication");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");

const router = express.Router({mergeParams: true});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/logoutAll', authenticate, logoutAll);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/profile/:token', verifyProfile);
router.put('/passwords/change', authenticate, changePassword);
router.put('/passwords/reset', resetPassword);
router.put('/pins/change', authenticate, changePin);
router.put('/pins/reset', resetPin);
router.post('/otp/resend', resendOTP);
router.post('/otp/:token/verify', verifyLoginOTP);

module.exports = router;
