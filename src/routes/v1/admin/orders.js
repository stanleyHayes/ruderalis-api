const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getOrders, getOrder, updateOrderStatus} = require("../../../controllers/v1/admin/orders");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, updateOrderStatus);

module.exports = router;
