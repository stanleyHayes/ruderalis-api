const express = require("express");
const {subscribe, unsubscribe} = require("../../../controllers/v1/user/newsletter");

const router = express.Router({mergeParams: true});

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

module.exports = router;
