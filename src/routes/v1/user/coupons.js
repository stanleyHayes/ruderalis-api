const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {getCoupons, validateCoupon, applyCoupon} = require("../../../controllers/v1/user/coupons");

const router = express.Router({mergeParams: true});

router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.post('/apply', authenticate, applyCoupon);

module.exports = router;
