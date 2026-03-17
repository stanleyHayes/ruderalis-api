const express = require("express");
const {getBlogs, getBlog} = require("../../../controllers/v1/user/blogs");

const router = express.Router({mergeParams: true});

router.get('/', getBlogs);
router.get('/:id', getBlog);

module.exports = router;
