const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getReferrals, getReferral, updateReferralStatus, getStats} = require("../../../controllers/v1/admin/referrals");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getReferrals);
router.get('/stats', authenticate, getStats);
router.get('/:id', authenticate, getReferral);
router.put('/:id/status', authenticate, updateReferralStatus);

module.exports = router;
