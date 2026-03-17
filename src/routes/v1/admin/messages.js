const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getMessages, getMessage, replyMessage} = require("../../../controllers/v1/admin/messages");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getMessages);
router.get('/:id', authenticate, getMessage);
router.put('/:id/reply', authenticate, replyMessage);

module.exports = router;
