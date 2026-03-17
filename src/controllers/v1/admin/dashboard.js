const User = require("./../../../models/v1/user");
const Shop = require("./../../../models/v1/shop");
const Product = require("./../../../models/v1/product");
const Order = require("./../../../models/v1/order");
const Payment = require("./../../../models/v1/payment");
const Review = require("./../../../models/v1/review");
const ShopReview = require("./../../../models/v1/shop-review");
const Message = require("./../../../models/v1/message");
const Referral = require("./../../../models/v1/referral");

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), monthNum: d.getMonth() + 1});
    }
    return months;
};

exports.getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        // ─── Stat cards ──────────────────────────────────
        const [
            totalRevenue, todaysOrders, activeUsers, lowStockItems,
            totalProducts, totalReferrals, referralConversions
        ] = await Promise.all([
            Payment.aggregate([{$match: {status: 'success'}}, {$group: {_id: null, total: {$sum: '$price.amount'}}}]),
            Order.countDocuments({createdAt: {$gte: todayStart}}),
            User.countDocuments({status: 'active'}),
            Product.countDocuments({status: 'active', 'stock.quantity': {$lt: 10, $gt: 0}}),
            Product.countDocuments(),
            Referral.countDocuments(),
            Referral.countDocuments({status: 'completed'})
        ]);

        // ─── Revenue chart — last 6 months ───────────────
        const last6 = getLast6Months();
        const revenueAgg = await Payment.aggregate([
            {$match: {status: 'success', createdAt: {$gte: sixMonthsAgo}}},
            {$group: {_id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}}, revenue: {$sum: '$price.amount'}}},
            {$sort: {'_id.year': 1, '_id.month': 1}}
        ]);
        const revenueData = last6.map(m => {
            const found = revenueAgg.find(r => r._id.month === m.monthNum && r._id.year === m.year);
            return {month: m.month, revenue: found ? found.revenue : 0};
        });

        // ─── Sales by category ───────────────────────────
        const categoryAgg = await Order.aggregate([
            {$unwind: '$items'},
            {$lookup: {from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod'}},
            {$unwind: '$prod'},
            {$group: {_id: '$prod.variant', count: {$sum: '$items.quantity'}}},
            {$sort: {count: -1}}
        ]);
        const catColors = {flower: '#0D6B3F', edible: '#F59E0B', concentrate: '#3B82F6', vape: '#8B5CF6', 'pre-roll': '#EC4899', tincture: '#06B6D4', topical: '#84CC16', accessory: '#F97316', marijuana: '#0D6B3F'};
        const totalCatCount = categoryAgg.reduce((s, c) => s + c.count, 0) || 1;
        const salesByCategory = categoryAgg.map(c => ({
            name: (c._id || 'Other').charAt(0).toUpperCase() + (c._id || 'other').slice(1),
            value: Math.round((c.count / totalCatCount) * 100),
            color: catColors[c._id] || '#6B7280'
        }));

        // ─── Daily orders this week ──────────────────────
        const weekOrders = await Order.aggregate([
            {$match: {createdAt: {$gte: weekStart}}},
            {$group: {_id: {$dayOfWeek: '$createdAt'}, orders: {$sum: 1}}},
            {$sort: {_id: 1}}
        ]);
        const dailyOrders = DAY_NAMES.map((day, i) => {
            const found = weekOrders.find(w => w._id === i + 1);
            return {day, orders: found ? found.orders : 0};
        });

        // ─── Top products ────────────────────────────────
        const topProducts = await Order.aggregate([
            {$unwind: '$items'},
            {$group: {_id: '$items.product', sales: {$sum: '$items.quantity'}, revenue: {$sum: {$multiply: ['$items.quantity', {$ifNull: ['$items.price', 0]}]}}}},
            {$sort: {sales: -1}},
            {$limit: 5},
            {$lookup: {from: 'products', localField: '_id', foreignField: '_id', as: 'product'}},
            {$unwind: '$product'},
            {$project: {name: '$product.name', sales: 1, revenue: 1}}
        ]);

        // ─── Recent orders ───────────────────────────────
        const recentOrders = await Order.find()
            .sort({createdAt: -1}).limit(5)
            .populate({path: 'user', select: 'firstName lastName fullName'})
            .select('orderNumber price status createdAt');

        // ─── Referral trend — last 6 months ──────────────
        const refAgg = await Referral.aggregate([
            {$match: {createdAt: {$gte: sixMonthsAgo}}},
            {$group: {
                _id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}},
                referrals: {$sum: 1},
                conversions: {$sum: {$cond: [{$eq: ['$status', 'completed']}, 1, 0]}}
            }},
            {$sort: {'_id.year': 1, '_id.month': 1}}
        ]);
        const referralData = last6.map(m => {
            const found = refAgg.find(r => r._id.month === m.monthNum && r._id.year === m.year);
            return {month: m.month, referrals: found ? found.referrals : 0, conversions: found ? found.conversions : 0};
        });

        // ─── Top referrers ───────────────────────────────
        const topReferrers = await Referral.aggregate([
            {$match: {status: 'completed'}},
            {$group: {_id: '$referrer', referrals: {$sum: 1}, earned: {$sum: '$reward.value'}}},
            {$sort: {referrals: -1}},
            {$limit: 5},
            {$lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'user'}},
            {$unwind: '$user'},
            {$project: {name: '$user.fullName', referrals: 1, earned: {$concat: ['GH₵', {$toString: '$earned'}, '.00']}, status: '$user.status'}}
        ]);

        res.status(200).json({
            message: 'Dashboard data retrieved successfully',
            data: {
                stats: {
                    totalRevenue: totalRevenue[0]?.total || 0,
                    todaysOrders,
                    activeUsers,
                    lowStockItems,
                    totalProducts,
                    complianceScore: 98,
                    totalReferrals,
                    referralConversions
                },
                revenueData,
                salesByCategory,
                dailyOrders,
                topProducts,
                recentOrders,
                referralData,
                topReferrers
            }
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getAnalytics = async (req, res) => {
    try {
        const {startDate, endDate} = req.query;
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const last6 = getLast6Months();

        const dateMatch = {};
        if (startDate) dateMatch['$gte'] = new Date(startDate);
        if (endDate) dateMatch['$lte'] = new Date(endDate);
        const orderMatch = (startDate || endDate) ? {createdAt: dateMatch} : {};

        // ─── Revenue data ────────────────────────────────
        const revenueAgg = await Payment.aggregate([
            {$match: {status: 'success', createdAt: {$gte: sixMonthsAgo}}},
            {$group: {_id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}}, revenue: {$sum: '$price.amount'}}},
            {$sort: {'_id.year': 1, '_id.month': 1}}
        ]);
        const revenueData = last6.map(m => {
            const found = revenueAgg.find(r => r._id.month === m.monthNum && r._id.year === m.year);
            return {month: m.month, revenue: found ? found.revenue : 0};
        });

        // ─── Sales by category ───────────────────────────
        const categoryAgg = await Order.aggregate([
            {$match: orderMatch},
            {$unwind: '$items'},
            {$lookup: {from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod'}},
            {$unwind: '$prod'},
            {$group: {_id: '$prod.variant', count: {$sum: '$items.quantity'}}},
            {$sort: {count: -1}}
        ]);
        const catColors = {flower: '#0D6B3F', edible: '#F59E0B', concentrate: '#3B82F6', vape: '#8B5CF6', 'pre-roll': '#EC4899', tincture: '#06B6D4', topical: '#84CC16', accessory: '#F97316', marijuana: '#0D6B3F'};
        const totalCatCount = categoryAgg.reduce((s, c) => s + c.count, 0) || 1;
        const salesByCategory = categoryAgg.map(c => ({
            name: (c._id || 'Other').charAt(0).toUpperCase() + (c._id || 'other').slice(1),
            value: Math.round((c.count / totalCatCount) * 100),
            color: catColors[c._id] || '#6B7280'
        }));

        // ─── Top products ────────────────────────────────
        const topProducts = await Order.aggregate([
            {$match: orderMatch},
            {$unwind: '$items'},
            {$group: {_id: '$items.product', sales: {$sum: '$items.quantity'}, revenue: {$sum: {$multiply: ['$items.quantity', {$ifNull: ['$items.price', 0]}]}}}},
            {$sort: {sales: -1}},
            {$limit: 5},
            {$lookup: {from: 'products', localField: '_id', foreignField: '_id', as: 'product'}},
            {$unwind: '$product'},
            {$project: {name: '$product.name', sales: 1, revenue: 1}}
        ]);

        // ─── Customer growth — last 6 months ─────────────
        const newUsersAgg = await User.aggregate([
            {$match: {createdAt: {$gte: sixMonthsAgo}}},
            {$group: {_id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}}, count: {$sum: 1}}}
        ]);
        const returningAgg = await Order.aggregate([
            {$match: {createdAt: {$gte: sixMonthsAgo}}},
            {$group: {_id: {user: '$user', month: {$month: '$createdAt'}, year: {$year: '$createdAt'}}}},
            {$group: {_id: {month: '$_id.month', year: '$_id.year'}, count: {$sum: 1}}}
        ]);
        const customerGrowth = last6.map(m => {
            const newFound = newUsersAgg.find(r => r._id.month === m.monthNum && r._id.year === m.year);
            const retFound = returningAgg.find(r => r._id.month === m.monthNum && r._id.year === m.year);
            return {month: m.month, new: newFound ? newFound.count : 0, returning: retFound ? retFound.count : 0};
        });

        // ─── Aggregate stats ─────────────────────────────
        const [totalRevenueAll, totalOrders, newThisMonth, avgOrderAgg] = await Promise.all([
            Payment.aggregate([{$match: {status: 'success'}}, {$group: {_id: null, total: {$sum: '$price.amount'}}}]),
            Order.countDocuments(),
            User.countDocuments({createdAt: {$gte: new Date(now.getFullYear(), now.getMonth(), 1)}}),
            Order.aggregate([{$group: {_id: null, avg: {$avg: '$price.amount'}}}])
        ]);

        res.status(200).json({
            message: 'Analytics retrieved successfully',
            data: {
                revenueData,
                salesByCategory,
                topProducts,
                customerGrowth,
                stats: {
                    totalRevenue: totalRevenueAll[0]?.total || 0,
                    totalOrders,
                    customerGrowth: newThisMonth,
                    avgOrderValue: Math.round((avgOrderAgg[0]?.avg || 0) * 100) / 100
                }
            }
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
