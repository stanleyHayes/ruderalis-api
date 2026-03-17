const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getDashboard, getAnalytics} = require("../../../controllers/v1/admin/dashboard");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getDashboard);
router.get('/analytics', authenticate, getAnalytics);

module.exports = router;
