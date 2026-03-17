const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getReviews, getReview, toggleReviewVisibility} = require("../../../controllers/v1/vendor/shop-reviews");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getReviews);
router.get('/:id', authenticate, getReview);
router.put('/:id/visibility', authenticate, toggleReviewVisibility);

module.exports = router;
