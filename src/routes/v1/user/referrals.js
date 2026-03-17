const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {getReferralCode, getReferrals, applyReferralCode} = require("../../../controllers/v1/user/referrals");

const router = express.Router({mergeParams: true});

router.get('/code', authenticate, getReferralCode);
router.get('/', authenticate, getReferrals);
router.post('/apply', authenticate, applyReferralCode);

module.exports = router;
