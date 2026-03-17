const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getDispensaries, getDispensary, createDispensary, updateDispensary, deleteDispensary} = require("../../../controllers/v1/admin/dispensaries");

const router = express.Router({mergeParams: true});

router.route('/')
    .get(authenticate, getDispensaries)
    .post(authenticate, createDispensary);

router.route('/:id')
    .get(authenticate, getDispensary)
    .put(authenticate, updateDispensary)
    .delete(authenticate, deleteDispensary);

module.exports = router;
