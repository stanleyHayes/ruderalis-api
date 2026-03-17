const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getPayments, getPayment, updatePaymentStatus} = require("../../../controllers/v1/admin/payments");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getPayments);
router.get('/:id', authenticate, getPayment);
router.put('/:id/status', authenticate, updatePaymentStatus);

module.exports = router;
