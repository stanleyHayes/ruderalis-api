const express = require("express");
const {authenticate} = require("../../../middleware/v1/user/authenticate");
const {getAddresses, getAddress, createAddress, updateAddress, deleteAddress} = require("../../../controllers/v1/user/addresses");

const router = express.Router({mergeParams: true});

router.route('/')
    .get(authenticate, getAddresses)
    .post(authenticate, createAddress);

router.route('/:id')
    .get(authenticate, getAddress)
    .put(authenticate, updateAddress)
    .delete(authenticate, deleteAddress);

module.exports = router;
