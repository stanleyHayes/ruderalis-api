const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getSettings, updateSettings} = require("../../../controllers/v1/admin/settings");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getSettings);
router.put('/', authenticate, updateSettings);

module.exports = router;
