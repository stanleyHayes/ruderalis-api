const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getDashboard, getAnalytics, getStats, getRecentOrders, getTopProducts} = require("../../../controllers/v1/vendor/dashboard");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getDashboard);
router.get('/stats', authenticate, getStats);
router.get('/analytics', authenticate, getAnalytics);
router.get('/recent-orders', authenticate, getRecentOrders);
router.get('/top-products', authenticate, getTopProducts);

module.exports = router;
