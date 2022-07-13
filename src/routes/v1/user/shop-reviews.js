const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
    createShopReview, deleteReview, getReview, getReviews, updateReview
} = require("../../../controllers/v1/user/shop-reviews");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createShopReview)
    .get(authenticate, getReviews);


router.route('/:id')
    .get(authenticate, getReview)
    .put(authenticate, updateReview)
    .delete(authenticate, deleteReview);


module.exports = router;