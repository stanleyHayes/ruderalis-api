const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getAuditLogs, getAuditLog} = require("../../../controllers/v1/admin/audit-log");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getAuditLogs);
router.get('/:id', authenticate, getAuditLog);

module.exports = router;
