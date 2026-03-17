const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {createPromotion, getPromotions, getPromotion} = require("../../../controllers/v1/vendor/promotions");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createPromotion)
    .get(authenticate, getPromotions);

router.route('/:id')
    .get(authenticate, getPromotion);

module.exports = router;
