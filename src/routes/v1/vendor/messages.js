const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getMessages, getMessage} = require("../../../controllers/v1/vendor/messages");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getMessages);
router.get('/:id', authenticate, getMessage);

module.exports = router;
