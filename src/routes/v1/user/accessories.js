const express = require("express");
const {getAccessories, getAccessory} = require("../../../controllers/v1/user/accessories");

const router = express.Router({mergeParams: true});

router.get('/', getAccessories);
router.get('/:id', getAccessory);

module.exports = router;
