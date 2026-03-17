const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getPayments, getPayment} = require("../../../controllers/v1/vendor/payments");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getPayments);
router.get('/:id', authenticate, getPayment);

module.exports = router;
