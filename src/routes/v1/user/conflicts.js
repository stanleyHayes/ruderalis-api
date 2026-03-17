const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {createConflict, getConflicts, getConflict, addComment} = require("../../../controllers/v1/user/conflicts");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createConflict)
    .get(authenticate, getConflicts);

router.get('/:id', authenticate, getConflict);
router.post('/:id/comments', authenticate, addComment);

module.exports = router;
