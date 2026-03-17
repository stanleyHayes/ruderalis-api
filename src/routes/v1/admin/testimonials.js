const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getTestimonials, getTestimonial, toggleVisibility, deleteTestimonial} = require("../../../controllers/v1/admin/testimonials");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getTestimonials);
router.get('/:id', authenticate, getTestimonial);
router.put('/:id/visibility', authenticate, toggleVisibility);
router.delete('/:id', authenticate, deleteTestimonial);

module.exports = router;
