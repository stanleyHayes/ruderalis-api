const express = require("express");
const {getEdibles, getEdible} = require("../../../controllers/v1/user/edibles");

const router = express.Router({mergeParams: true});

router.get('/', getEdibles);
router.get('/:id', getEdible);

module.exports = router;
