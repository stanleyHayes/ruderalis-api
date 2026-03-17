const cors = require("cors");
const express = require("express");
const expressUserAgent = require("express-useragent");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");

const keys = require("./config/keys");

// User routes
const userAuthV1Routes = require("./routes/v1/user/authentication");
const userProductV1Routes = require("./routes/v1/user/products");
const userShopV1Routes = require("./routes/v1/user/shops");
const userReviewV1Routes = require("./routes/v1/user/reviews");
const userShopReviewV1Routes = require("./routes/v1/user/shop-reviews");
const userOrderV1Routes = require("./routes/v1/user/orders");
const userPaymentV1Routes = require("./routes/v1/user/payments");
const userPromotionV1Routes = require("./routes/v1/user/promotions");
const userTestimonialV1Routes = require("./routes/v1/user/testimonials");
const userFAQV1Routes = require("./routes/v1/user/faqs");
const userMessageV1Routes = require("./routes/v1/user/messages");
const userCustomerV1Routes = require("./routes/v1/user/customers");
const userShopVisitV1Routes = require("./routes/v1/user/shop-visits");
const userWishlistV1Routes = require("./routes/v1/user/wishlists");
const userAddressV1Routes = require("./routes/v1/user/addresses");
const userBlogV1Routes = require("./routes/v1/user/blogs");
const userTrackingV1Routes = require("./routes/v1/user/tracking");
const userPaymentMethodV1Routes = require("./routes/v1/user/payment-methods");
const userCouponV1Routes = require("./routes/v1/user/coupons");
const userNewsletterV1Routes = require("./routes/v1/user/newsletter");
const userContactV1Routes = require("./routes/v1/user/contact");
const userReferralV1Routes = require("./routes/v1/user/referrals");
const userEdibleV1Routes = require("./routes/v1/user/edibles");
const userAccessoryV1Routes = require("./routes/v1/user/accessories");
const userConflictV1Routes = require("./routes/v1/user/conflicts");

// Vendor routes
const vendorAuthV1Routes = require("./routes/v1/vendor/auth");
const vendorShopV1Routes = require("./routes/v1/vendor/shops");
const vendorProductV1Routes = require("./routes/v1/vendor/products");
const vendorOrderV1Routes = require("./routes/v1/vendor/orders");
const vendorReviewV1Routes = require("./routes/v1/vendor/reviews");
const vendorShopReviewV1Routes = require("./routes/v1/vendor/shop-reviews");
const vendorCustomerV1Routes = require("./routes/v1/vendor/customers");
const vendorPromotionV1Routes = require("./routes/v1/vendor/promotions");
const vendorPaymentV1Routes = require("./routes/v1/vendor/payments");
const vendorShopVisitV1Routes = require("./routes/v1/vendor/shop-visits");
const vendorDashboardV1Routes = require("./routes/v1/vendor/dashboard");
const vendorFundsV1Routes = require("./routes/v1/vendor/funds");
const vendorRevenueV1Routes = require("./routes/v1/vendor/revenue");
const vendorReportsV1Routes = require("./routes/v1/vendor/reports");
const vendorMessageV1Routes = require("./routes/v1/vendor/messages");
const vendorConflictV1Routes = require("./routes/v1/vendor/conflicts");

// Admin routes
const adminAuthV1Routes = require("./routes/v1/admin/authentication");
const adminUserV1Routes = require("./routes/v1/admin/users");
const adminShopV1Routes = require("./routes/v1/admin/shops");
const adminProductV1Routes = require("./routes/v1/admin/products");
const adminOrderV1Routes = require("./routes/v1/admin/orders");
const adminReviewV1Routes = require("./routes/v1/admin/reviews");
const adminShopReviewV1Routes = require("./routes/v1/admin/shop-reviews");
const adminTestimonialV1Routes = require("./routes/v1/admin/testimonials");
const adminFAQV1Routes = require("./routes/v1/admin/faqs");
const adminMessageV1Routes = require("./routes/v1/admin/messages");
const adminAdminV1Routes = require("./routes/v1/admin/admins");
const adminPaymentV1Routes = require("./routes/v1/admin/payments");
const adminPromotionV1Routes = require("./routes/v1/admin/promotions");
const adminDashboardV1Routes = require("./routes/v1/admin/dashboard");
const adminBlogV1Routes = require("./routes/v1/admin/blogs");
const adminCouponV1Routes = require("./routes/v1/admin/coupons");
const adminNewsletterV1Routes = require("./routes/v1/admin/newsletter");
const adminConflictV1Routes = require("./routes/v1/admin/conflicts");
const adminReferralV1Routes = require("./routes/v1/admin/referrals");
const adminCategoryV1Routes = require("./routes/v1/admin/categories");
const adminBatchV1Routes = require("./routes/v1/admin/batches");
const adminComplianceV1Routes = require("./routes/v1/admin/compliance");
const adminAuditLogV1Routes = require("./routes/v1/admin/audit-log");
const adminDispensaryV1Routes = require("./routes/v1/admin/dispensaries");
const adminSettingsV1Routes = require("./routes/v1/admin/settings");

mongoose.connect(keys.mongoDBURI).then(value => {
    console.log(`Connected to MongoDB on database ${value.connection.db.databaseName}`);
}).catch(error => {
    console.log(`Error: ${error.message}`);
});

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet({crossOriginResourcePolicy: {policy: 'cross-origin'}}))
app.use(express.json({limit: '5MB'}));
app.use(expressUserAgent.express());
app.use(morgan("dev"));

// User routes
app.use('/api/v1/user/auth', userAuthV1Routes);
app.use('/api/v1/user/products', userProductV1Routes);
app.use('/api/v1/user/shops', userShopV1Routes);
app.use('/api/v1/user/reviews', userReviewV1Routes);
app.use('/api/v1/user/shop-reviews', userShopReviewV1Routes);
app.use('/api/v1/user/orders', userOrderV1Routes);
app.use('/api/v1/user/payments', userPaymentV1Routes);
app.use('/api/v1/user/promotions', userPromotionV1Routes);
app.use('/api/v1/user/testimonials', userTestimonialV1Routes);
app.use('/api/v1/user/faqs', userFAQV1Routes);
app.use('/api/v1/user/messages', userMessageV1Routes);
app.use('/api/v1/user/customers', userCustomerV1Routes);
app.use('/api/v1/user/shop-visits', userShopVisitV1Routes);
app.use('/api/v1/user/wishlists', userWishlistV1Routes);
app.use('/api/v1/user/addresses', userAddressV1Routes);
app.use('/api/v1/user/blogs', userBlogV1Routes);
app.use('/api/v1/user/tracking', userTrackingV1Routes);
app.use('/api/v1/user/payment-methods', userPaymentMethodV1Routes);
app.use('/api/v1/user/coupons', userCouponV1Routes);
app.use('/api/v1/user/newsletter', userNewsletterV1Routes);
app.use('/api/v1/user/contact', userContactV1Routes);
app.use('/api/v1/user/referrals', userReferralV1Routes);
app.use('/api/v1/user/edibles', userEdibleV1Routes);
app.use('/api/v1/user/accessories', userAccessoryV1Routes);
app.use('/api/v1/user/conflicts', userConflictV1Routes);

// Vendor routes
app.use('/api/v1/vendor/auth', vendorAuthV1Routes);
app.use('/api/v1/vendor/shops', vendorShopV1Routes);
app.use('/api/v1/vendor/products', vendorProductV1Routes);
app.use('/api/v1/vendor/orders', vendorOrderV1Routes);
app.use('/api/v1/vendor/reviews', vendorReviewV1Routes);
app.use('/api/v1/vendor/shop-reviews', vendorShopReviewV1Routes);
app.use('/api/v1/vendor/customers', vendorCustomerV1Routes);
app.use('/api/v1/vendor/promotions', vendorPromotionV1Routes);
app.use('/api/v1/vendor/payments', vendorPaymentV1Routes);
app.use('/api/v1/vendor/shop-visits', vendorShopVisitV1Routes);
app.use('/api/v1/vendor/dashboard', vendorDashboardV1Routes);
app.use('/api/v1/vendor/funds', vendorFundsV1Routes);
app.use('/api/v1/vendor/revenue', vendorRevenueV1Routes);
app.use('/api/v1/vendor/reports', vendorReportsV1Routes);
app.use('/api/v1/vendor/messages', vendorMessageV1Routes);
app.use('/api/v1/vendor/conflicts', vendorConflictV1Routes);

// Admin routes
app.use('/api/v1/admin/auth', adminAuthV1Routes);
app.use('/api/v1/admin/users', adminUserV1Routes);
app.use('/api/v1/admin/shops', adminShopV1Routes);
app.use('/api/v1/admin/products', adminProductV1Routes);
app.use('/api/v1/admin/orders', adminOrderV1Routes);
app.use('/api/v1/admin/reviews', adminReviewV1Routes);
app.use('/api/v1/admin/shop-reviews', adminShopReviewV1Routes);
app.use('/api/v1/admin/testimonials', adminTestimonialV1Routes);
app.use('/api/v1/admin/faqs', adminFAQV1Routes);
app.use('/api/v1/admin/messages', adminMessageV1Routes);
app.use('/api/v1/admin/admins', adminAdminV1Routes);
app.use('/api/v1/admin/payments', adminPaymentV1Routes);
app.use('/api/v1/admin/promotions', adminPromotionV1Routes);
app.use('/api/v1/admin/dashboard', adminDashboardV1Routes);
app.use('/api/v1/admin/blogs', adminBlogV1Routes);
app.use('/api/v1/admin/coupons', adminCouponV1Routes);
app.use('/api/v1/admin/newsletter', adminNewsletterV1Routes);
app.use('/api/v1/admin/conflicts', adminConflictV1Routes);
app.use('/api/v1/admin/referrals', adminReferralV1Routes);
app.use('/api/v1/admin/categories', adminCategoryV1Routes);
app.use('/api/v1/admin/batches', adminBatchV1Routes);
app.use('/api/v1/admin/compliance', adminComplianceV1Routes);
app.use('/api/v1/admin/audit-log', adminAuditLogV1Routes);
app.use('/api/v1/admin/dispensaries', adminDispensaryV1Routes);
app.use('/api/v1/admin/settings', adminSettingsV1Routes);

// Global error handler (Express 5)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({message: err.message || 'Internal Server Error'});
});

const port = process.env.PORT || keys.port;

app.listen(port, () => {
    console.log(`Server connected in ${keys.nodeENV} mode on port ${port}`);
});
