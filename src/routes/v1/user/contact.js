const express = require("express");
const {submitContactForm} = require("../../../controllers/v1/user/contact");

const router = express.Router({mergeParams: true});

router.post('/', submitContactForm);

module.exports = router;
