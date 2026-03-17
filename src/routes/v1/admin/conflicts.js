const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getConflicts, getConflict, assignConflict, updateStatus, updatePriority, addComment, resolveConflict} = require("../../../controllers/v1/admin/conflicts");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getConflicts);
router.get('/:id', authenticate, getConflict);
router.put('/:id/assign', authenticate, assignConflict);
router.put('/:id/status', authenticate, updateStatus);
router.put('/:id/priority', authenticate, updatePriority);
router.post('/:id/comments', authenticate, addComment);
router.put('/:id/resolve', authenticate, resolveConflict);

module.exports = router;
