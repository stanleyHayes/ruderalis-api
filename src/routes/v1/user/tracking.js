const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {trackOrder} = require("../../../controllers/v1/user/tracking");

const router = express.Router({mergeParams: true});

router.get('/:code', authenticate, trackOrder);

module.exports = router;
