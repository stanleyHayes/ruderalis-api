const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
    createOrder, getOrders, getOrder, updateOrder, cancelOrder
} = require("../../../controllers/v1/user/orders");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createOrder)
    .get(authenticate, getOrders);

router.route('/:id')
    .get(authenticate, getOrder)
    .put(authenticate, updateOrder);

router.put('/:id/cancel', authenticate, cancelOrder);

module.exports = router;
