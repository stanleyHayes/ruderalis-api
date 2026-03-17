const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getCompliance, getLicenses, createLicense, updateLicense, deleteLicense} = require("../../../controllers/v1/admin/compliance");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getCompliance);
router.get('/licenses', authenticate, getLicenses);
router.post('/licenses', authenticate, createLicense);
router.put('/licenses/:id', authenticate, updateLicense);
router.delete('/licenses/:id', authenticate, deleteLicense);

module.exports = router;
