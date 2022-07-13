const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
createPromotion, getPromotion, getPromotions
} = require("../../../controllers/v1/user/promotions");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createPromotion)
    .get(authenticate, getPromotions);


router.route('/:id')
    .get(authenticate, getPromotion);

module.exports = router;