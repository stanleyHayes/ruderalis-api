const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {createShopVisit, getShopVisits} = require("../../../controllers/v1/user/shop-visits");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createShopVisit)
    .get(authenticate, getShopVisits);

module.exports = router;
