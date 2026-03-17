const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getShopVisits} = require("../../../controllers/v1/vendor/shop-visits");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getShopVisits);

module.exports = router;
