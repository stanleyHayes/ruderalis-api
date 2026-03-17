const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {getWishlists, addToWishlist, removeFromWishlist} = require("../../../controllers/v1/user/wishlists");

const router = express.Router({mergeParams: true});

router.route('/')
    .get(authenticate, getWishlists)
    .post(authenticate, addToWishlist);

router.delete('/:id', authenticate, removeFromWishlist);

module.exports = router;
