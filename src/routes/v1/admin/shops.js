const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getShops, getShop, approveShop, suspendShop, featureShop, updateShopStatus} = require("../../../controllers/v1/admin/shops");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getShops);
router.get('/:id', authenticate, getShop);
router.put('/:id/approve', authenticate, approveShop);
router.put('/:id/suspend', authenticate, suspendShop);
router.put('/:id/feature', authenticate, featureShop);
router.put('/:id/status', authenticate, updateShopStatus);

module.exports = router;
