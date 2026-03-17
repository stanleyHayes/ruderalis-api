const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getCustomers} = require("../../../controllers/v1/vendor/customers");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getCustomers);

module.exports = router;
