const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {getPaymentMethods, getPaymentMethod, createPaymentMethod, deletePaymentMethod} = require("../../../controllers/v1/user/payment-methods");

const router = express.Router({mergeParams: true});

router.route('/')
    .get(authenticate, getPaymentMethods)
    .post(authenticate, createPaymentMethod);

router.route('/:id')
    .get(authenticate, getPaymentMethod)
    .delete(authenticate, deletePaymentMethod);

module.exports = router;
