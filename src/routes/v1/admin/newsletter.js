const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getSubscribers} = require("../../../controllers/v1/admin/newsletter");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getSubscribers);

module.exports = router;
