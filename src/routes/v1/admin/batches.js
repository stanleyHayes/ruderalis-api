const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getBatches, getBatch, createBatch, updateBatch, deleteBatch} = require("../../../controllers/v1/admin/batches");

const router = express.Router({mergeParams: true});

router.route('/')
    .get(authenticate, getBatches)
    .post(authenticate, createBatch);

router.route('/:id')
    .get(authenticate, getBatch)
    .put(authenticate, updateBatch)
    .delete(authenticate, deleteBatch);

module.exports = router;
