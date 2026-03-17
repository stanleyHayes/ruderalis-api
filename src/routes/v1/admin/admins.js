const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getAdmins, getAdmin, updateAdmin, deleteAdmin} = require("../../../controllers/v1/admin/admins");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getAdmins);
router.get('/:id', authenticate, getAdmin);
router.put('/:id', authenticate, updateAdmin);
router.delete('/:id', authenticate, deleteAdmin);

module.exports = router;
