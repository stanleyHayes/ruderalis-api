const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
    createShop,
    getShops,
    getShop,
    updateShop,
    deleteShop
} = require("../../../controllers/v1/user/shops");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createShop)
    .get(authenticate, getShops);


router.route('/:id')
    .get(authenticate, getShop)
    .put(authenticate, updateShop)
    .delete(authenticate, deleteShop);


module.exports = router;