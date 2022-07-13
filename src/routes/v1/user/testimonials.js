const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {
   createTestimonial, deleteTestimonial, getTestimonial, getTestimonials, updateTestimonial
} = require("../../../controllers/v1/user/testimonials");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createTestimonial)
    .get(authenticate, getTestimonials);


router.route('/:id')
    .get(authenticate, getTestimonial)
    .put(authenticate, updateTestimonial)
    .delete(authenticate, deleteTestimonial);


module.exports = router;