const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {createCoupon, getCoupons, getCoupon, updateCoupon, deleteCoupon} = require("../../../controllers/v1/admin/coupons");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createCoupon)
    .get(authenticate, getCoupons);

router.route('/:id')
    .get(authenticate, getCoupon)
    .put(authenticate, updateCoupon)
    .delete(authenticate, deleteCoupon);

module.exports = router;
