const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
    createReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview
} = require("../../../controllers/v1/user/reviews");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createReview)
    .get(authenticate, getReviews);

router.route('/:id')
    .get(authenticate, getReview)
    .put(authenticate, updateReview)
    .delete(authenticate, deleteReview);