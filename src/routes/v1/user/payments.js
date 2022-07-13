const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
   makePayment, getPayment, getPayments
} = require("../../../controllers/v1/user/payments");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, makePayment)
    .get(authenticate, getPayments);

router.route('/:id')
    .get(authenticate, getPayment);