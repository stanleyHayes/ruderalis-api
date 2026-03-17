const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getReviews, getReview, toggleReviewVisibility, deleteReview} = require("../../../controllers/v1/admin/product-reviews");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getReviews);
router.get('/:id', authenticate, getReview);
router.put('/:id/visibility', authenticate, toggleReviewVisibility);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
