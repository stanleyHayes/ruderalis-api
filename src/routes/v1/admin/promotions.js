const express = require("express");
const {authenticate} = require("../../../middleware/v1/admin/authenticate");
const {getPromotions, getPromotion, updatePromotionStatus} = require("../../../controllers/v1/admin/promotions");

const router = express.Router({mergeParams: true});

router.get('/', authenticate, getPromotions);
router.get('/:id', authenticate, getPromotion);
router.put('/:id/status', authenticate, updatePromotionStatus);

module.exports = router;
