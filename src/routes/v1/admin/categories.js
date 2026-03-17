const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getCategories} = require("../../../controllers/v1/admin/categories");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getCategories);

module.exports = router;
