const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getProducts, getProduct, approveProduct, featureProduct, setSaleProduct, updateProductStatus} = require("../../../controllers/v1/admin/products");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProduct);
router.put('/:id/approve', authenticate, approveProduct);
router.put('/:id/feature', authenticate, featureProduct);
router.put('/:id/sale', authenticate, setSaleProduct);
router.put('/:id/status', authenticate, updateProductStatus);

module.exports = router;
