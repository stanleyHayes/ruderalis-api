const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getSummary, getMonthly} = require("../../../controllers/v1/vendor/revenue");

const router = express.Router({mergeParams: true});

router.get('/summary', authenticate, getSummary);
router.get('/monthly', authenticate, getMonthly);

module.exports = router;
