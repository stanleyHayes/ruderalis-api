const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {createBlog, getBlogs, getBlog, updateBlog, deleteBlog} = require("../../../controllers/v1/admin/blogs");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createBlog)
    .get(authenticate, getBlogs);

router.route('/:id')
    .get(authenticate, getBlog)
    .put(authenticate, updateBlog)
    .delete(authenticate, deleteBlog);

module.exports = router;
