const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getOrders, getOrder, updateOrderStatus, updateOrderItemStatus} = require("../../../controllers/v1/vendor/orders");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, updateOrderStatus);
router.put('/:id/item-status', authenticate, updateOrderItemStatus);

module.exports = router;
