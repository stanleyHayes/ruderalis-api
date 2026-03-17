const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {createShop, getShops, getShop, updateShop, deleteShop} = require("../../../controllers/v1/vendor/shops");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createShop)
    .get(authenticate, getShops);

router.route('/:id')
    .get(authenticate, getShop)
    .put(authenticate, updateShop)
    .delete(authenticate, deleteShop);

module.exports = router;
