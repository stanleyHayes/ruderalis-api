const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {getCustomers} = require("../../../controllers/v1/user/customers");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getCustomers);

module.exports = router;
