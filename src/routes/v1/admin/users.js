const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getUsers, getUser, updateUserStatus, updateUserPermissions} = require("../../../controllers/v1/admin/users");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUser);
router.put('/:id/status', authenticate, updateUserStatus);
router.put('/:id/permissions', authenticate, updateUserPermissions);

module.exports = router;
