const Coupon = require("./../../../models/v1/coupon");
const Order = require("./../../../models/v1/order");

exports.getCoupons = async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            active: true,
            startDate: {$lte: now},
            endDate: {$gte: now}
        }).select('-usedBy -createdBy').sort({createdAt: -1});
        res.status(200).json({message: 'Coupons retrieved', data: coupons});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


const validateCouponEligibility = async (coupon, userId, userRole, orderData) => {
    const now = new Date();

    // Date check
    if (now < coupon.startDate || now > coupon.endDate)
        return {valid: false, message: 'Coupon has expired'};

    // Active check
    if (!coupon.active)
        return {valid: false, message: 'Coupon is no longer active'};

    // Global usage limit
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
        return {valid: false, message: 'Coupon usage limit reached'};

    // Per-user usage limit
    if (userId && coupon.maxUsesPerUser > 0) {
        const userUsage = coupon.usedBy.find(u => u.user.toString() === userId.toString());
        if (userUsage && userUsage.count >= coupon.maxUsesPerUser)
            return {valid: false, message: `You have already used this coupon ${coupon.maxUsesPerUser} time(s)`};
    }

    // User whitelist
    if (coupon.applicableUsers.length > 0 && userId) {
        if (!coupon.applicableUsers.some(u => u.toString() === userId.toString()))
            return {valid: false, message: 'This coupon is not available for your account'};
    }

    // User blacklist
    if (coupon.excludedUsers.length > 0 && userId) {
        if (coupon.excludedUsers.some(u => u.toString() === userId.toString()))
            return {valid: false, message: 'This coupon is not available for your account'};
    }

    // Role restriction
    if (coupon.applicableRoles.length > 0 && userRole) {
        if (!coupon.applicableRoles.includes(userRole))
            return {valid: false, message: `This coupon is only available for ${coupon.applicableRoles.join(', ')} accounts`};
    }

    // First order only
    if (coupon.firstOrderOnly && userId) {
        const orderCount = await Order.countDocuments({user: userId});
        if (orderCount > 0)
            return {valid: false, message: 'This coupon is only valid for your first order'};
    }

    // New users only (registered within 30 days)
    if (coupon.newUsersOnly && orderData?.userCreatedAt) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
        if (new Date(orderData.userCreatedAt) < thirtyDaysAgo)
            return {valid: false, message: 'This coupon is only available for new members'};
    }

    // Min order amount
    if (coupon.minOrderAmount > 0 && orderData?.subtotal) {
        if (orderData.subtotal < coupon.minOrderAmount)
            return {valid: false, message: `Minimum order amount is GHS ${coupon.minOrderAmount}`};
    }

    // Max order amount
    if (coupon.maxOrderAmount > 0 && orderData?.subtotal) {
        if (orderData.subtotal > coupon.maxOrderAmount)
            return {valid: false, message: `This coupon is only valid for orders under GHS ${coupon.maxOrderAmount}`};
    }

    // Min items
    if (coupon.minItems > 0 && orderData?.itemCount) {
        if (orderData.itemCount < coupon.minItems)
            return {valid: false, message: `You need at least ${coupon.minItems} item(s) in your cart`};
    }

    // Shop restriction
    if (coupon.applicableShops.length > 0 && orderData?.shopId) {
        if (!coupon.applicableShops.some(s => s.toString() === orderData.shopId.toString()))
            return {valid: false, message: 'This coupon is not valid for this shop'};
    }
    if (coupon.excludedShops.length > 0 && orderData?.shopId) {
        if (coupon.excludedShops.some(s => s.toString() === orderData.shopId.toString()))
            return {valid: false, message: 'This coupon is not valid for this shop'};
    }

    // Product restriction
    if (coupon.applicableProducts.length > 0 && orderData?.productIds) {
        const hasApplicable = orderData.productIds.some(pid =>
            coupon.applicableProducts.some(ap => ap.toString() === pid.toString())
        );
        if (!hasApplicable)
            return {valid: false, message: 'This coupon does not apply to any products in your cart'};
    }
    if (coupon.excludedProducts.length > 0 && orderData?.productIds) {
        const allExcluded = orderData.productIds.every(pid =>
            coupon.excludedProducts.some(ep => ep.toString() === pid.toString())
        );
        if (allExcluded)
            return {valid: false, message: 'This coupon does not apply to the products in your cart'};
    }

    // Category restriction
    if (coupon.applicableCategories.length > 0 && orderData?.categories) {
        const hasApplicable = orderData.categories.some(c => coupon.applicableCategories.includes(c));
        if (!hasApplicable)
            return {valid: false, message: 'This coupon does not apply to the product categories in your cart'};
    }
    if (coupon.excludedCategories.length > 0 && orderData?.categories) {
        const allExcluded = orderData.categories.every(c => coupon.excludedCategories.includes(c));
        if (allExcluded)
            return {valid: false, message: 'This coupon does not apply to the product categories in your cart'};
    }

    // Variant restriction
    if (coupon.applicableVariants.length > 0 && orderData?.variants) {
        const hasApplicable = orderData.variants.some(v => coupon.applicableVariants.includes(v));
        if (!hasApplicable)
            return {valid: false, message: 'This coupon does not apply to the product types in your cart'};
    }

    return {valid: true};
};


const calculateDiscount = (coupon, subtotal) => {
    let discount = 0;
    if (coupon.discount.type === 'percentage') {
        discount = Math.round(subtotal * (coupon.discount.value / 100) * 100) / 100;
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    } else {
        discount = coupon.discount.value;
    }
    return Math.min(discount, subtotal);
};


exports.validateCoupon = async (req, res) => {
    try {
        const {code, orderAmount, shopId, productIds, categories, variants, itemCount} = req.body;
        if (!code)
            return res.status(400).json({message: 'Coupon code is required'});
        const coupon = await Coupon.findOne({code: code.toUpperCase()});
        if (!coupon)
            return res.status(404).json({message: 'Invalid coupon code'});

        const eligibility = await validateCouponEligibility(coupon, req.user?._id, req.user?.role, {
            subtotal: orderAmount, shopId, productIds, categories, variants, itemCount,
            userCreatedAt: req.user?.createdAt
        });

        if (!eligibility.valid)
            return res.status(400).json({message: eligibility.message});

        const discount = calculateDiscount(coupon, orderAmount || 0);

        res.status(200).json({
            message: 'Coupon is valid',
            data: {
                code: coupon.code,
                description: coupon.description,
                discount: {type: coupon.discount.type, value: coupon.discount.value},
                calculatedDiscount: discount,
                freeShipping: coupon.freeShipping,
                canCombine: coupon.canCombine
            }
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.applyCoupon = async (req, res) => {
    try {
        const {code, orderAmount, shopId, productIds, categories, variants, itemCount} = req.body;
        if (!code)
            return res.status(400).json({message: 'Coupon code is required'});
        const coupon = await Coupon.findOne({code: code.toUpperCase()});
        if (!coupon)
            return res.status(404).json({message: 'Invalid coupon code'});

        const eligibility = await validateCouponEligibility(coupon, req.user._id, req.user.role, {
            subtotal: orderAmount, shopId, productIds, categories, variants, itemCount,
            userCreatedAt: req.user.createdAt
        });

        if (!eligibility.valid)
            return res.status(400).json({message: eligibility.message});

        const discount = calculateDiscount(coupon, orderAmount || 0);

        // Track usage
        const userUsageIdx = coupon.usedBy.findIndex(u => u.user.toString() === req.user._id.toString());
        if (userUsageIdx >= 0) {
            coupon.usedBy[userUsageIdx].count += 1;
            coupon.usedBy[userUsageIdx].lastUsed = new Date();
        } else {
            coupon.usedBy.push({user: req.user._id, count: 1});
        }
        coupon.usedCount += 1;
        await coupon.save();

        res.status(200).json({
            message: 'Coupon applied successfully',
            data: {
                code: coupon.code,
                discount: {type: coupon.discount.type, value: coupon.discount.value},
                calculatedDiscount: discount,
                freeShipping: coupon.freeShipping
            }
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

// Export for use in order creation
exports.validateCouponEligibility = validateCouponEligibility;
exports.calculateDiscount = calculateDiscount;
