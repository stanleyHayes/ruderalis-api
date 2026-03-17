const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {
    register, login, verifyLoginOTP, forgotPassword, resetPassword,
    getProfile, updateProfile, changePassword, verifyEmail,
    deleteAccount, logout, resendOTP
} = require("../../../controllers/v1/vendor/auth");

const router = express.Router({mergeParams: true});

router.post('/register', register);
router.post('/login', login);
router.post('/otp/:token/verify', verifyLoginOTP);
router.post('/otp/resend', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify/:token', verifyEmail);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);
router.post('/logout', authenticate, logout);

module.exports = router;
