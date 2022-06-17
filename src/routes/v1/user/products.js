const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require("../../../controllers/v1/user/products");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createProduct)
    .get(authenticate, getProducts);


router.route('/:id')
    .get(authenticate, getProduct)
    .put(authenticate, updateProduct)
    .delete(authenticate, deleteProduct);


module.exports = router;