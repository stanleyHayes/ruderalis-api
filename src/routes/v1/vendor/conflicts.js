const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getConflicts, getConflict, addComment, acceptResolution} = require("../../../controllers/v1/vendor/conflicts");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getConflicts);
router.get('/:id', authenticate, getConflict);
router.post('/:id/comments', authenticate, addComment);
router.put('/:id/accept', authenticate, acceptResolution);

module.exports = router;
