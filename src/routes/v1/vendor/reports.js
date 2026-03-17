const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getSalesReport, getProductsReport, getCustomersReport, getFinancialReport} = require("../../../controllers/v1/vendor/reports");

const router = express.Router({mergeParams: true});

router.get('/sales', authenticate, getSalesReport);
router.get('/products', authenticate, getProductsReport);
router.get('/customers', authenticate, getCustomersReport);
router.get('/financial', authenticate, getFinancialReport);

module.exports = router;
