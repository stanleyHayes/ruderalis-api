const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {createMessage, getMessages, getMessage} = require("../../../controllers/v1/user/messages");

const router = express.Router({mergeParams: true});

router.route('/')
    .post(authenticate, createMessage)
    .get(authenticate, getMessages);

router.route('/:id')
    .get(authenticate, getMessage);

module.exports = router;
