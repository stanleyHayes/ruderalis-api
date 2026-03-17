const express = require("express");
const {getFAQs, getFAQ} = require("../../../controllers/v1/user/faqs");

const router = express.Router({mergeParams: true});

router.get('/', getFAQs);
router.get('/:id', getFAQ);

module.exports = router;
