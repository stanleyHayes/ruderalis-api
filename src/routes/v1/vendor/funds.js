const express = require("express");
const {authenticate} = require("../../../middleware/v1/vendor/authenticate");
const {getBalance, getTransactions, requestWithdrawal} = require("../../../controllers/v1/vendor/funds");

const router = express.Router({mergeParams: true});

router.get('/balance', authenticate, getBalance);
router.get('/transactions', authenticate, getTransactions);
router.post('/withdraw', authenticate, requestWithdrawal);

module.exports = router;
