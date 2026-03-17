const Shop = require("./../../../models/v1/shop");
const Product = require("./../../../models/v1/product");
const Order = require("./../../../models/v1/order");
const Review = require("./../../../models/v1/review");
const ShopReview = require("./../../../models/v1/shop-review");
const ShopVisit = require("./../../../models/v1/shop-visit");
const Payment = require("./../../../models/v1/payment");
const Conflict = require("./../../../models/v1/conflict");

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), monthNum: d.getMonth() + 1});
    }
    return months;
};


exports.getStats = async (req, res) => {
    try {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const last6 = getLast6Months();

        const allShops = await Shop.find({owner: req.user._id});
        const shopIds = allShops.map(s => s._id);
        const shopMatch = {shop: {$in: shopIds}};

        // ─── Summary Stats ───────────────────────────────
        const [totalOrders, totalProducts, totalRevenueAgg, totalCustomersAgg] = await Promise.all([
            Order.countDocuments(shopMatch),
            Product.countDocuments({owner: req.user._id}),
            Order.aggregate([{$match: {...shopMatch, status: {$in: ['completed', 'delivered']}}}, {$group: {_id: null, total: {$sum: '$price.amount'}}}]),
            Order.aggregate([{$match: shopMatch}, {$group: {_id: '$user'}}, {$count: 'total'}])
        ]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        const totalCustomers = totalCustomersAgg[0]?.total || 0;

        // ─── Change percentages (this month vs last month) ──
        const [thisMonthRevAgg, lastMonthRevAgg, thisMonthOrders, lastMonthOrders, thisMonthProducts, lastMonthProducts, thisMonthCustAgg, lastMonthCustAgg] = await Promise.all([
            Order.aggregate([{$match: {...shopMatch, status: {$in: ['completed', 'delivered']}, createdAt: {$gte: thisMonthStart}}}, {$group: {_id: null, total: {$sum: '$price.amount'}}}]),
            Order.aggregate([{$match: {...shopMatch, status: {$in: ['completed', 'delivered']}, createdAt: {$gte: lastMonthStart, $lt: thisMonthStart}}}, {$group: {_id: null, total: {$sum: '$price.amount'}}}]),
            Order.countDocuments({...shopMatch, createdAt: {$gte: thisMonthStart}}),
            Order.countDocuments({...shopMatch, createdAt: {$gte: lastMonthStart, $lt: thisMonthStart}}),
            Product.countDocuments({owner: req.user._id, createdAt: {$gte: thisMonthStart}}),
            Product.countDocuments({owner: req.user._id, createdAt: {$gte: lastMonthStart, $lt: thisMonthStart}}),
            Order.aggregate([{$match: {...shopMatch, createdAt: {$gte: thisMonthStart}}}, {$group: {_id: '$user'}}, {$count: 'total'}]),
            Order.aggregate([{$match: {...shopMatch, createdAt: {$gte: lastMonthStart, $lt: thisMonthStart}}}, {$group: {_id: '$user'}}, {$count: 'total'}])
        ]);
        const pctChange = (curr, prev) => prev ? Math.round(((curr - prev) / prev) * 100 * 10) / 10 : curr > 0 ? 100 : 0;
        const revenueChange = pctChange(thisMonthRevAgg[0]?.total || 0, lastMonthRevAgg[0]?.total || 0);
        const ordersChange = pctChange(thisMonthOrders, lastMonthOrders);
        const productsChange = pctChange(thisMonthProducts, lastMonthProducts);
        const customersChange = pctChange(thisMonthCustAgg[0]?.total || 0, lastMonthCustAgg[0]?.total || 0);

        // ─── Monthly Revenue (last 6 months) ────────────
        const monthlyAgg = await Order.aggregate([
            {$match: {...shopMatch, status: {$in: ['completed', 'delivered']}, createdAt: {$gte: sixMonthsAgo}}},
            {$group: {_id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}}, revenue: {$sum: '$price.amount'}, orders: {$sum: 1}}},
            {$sort: {'_id.year': 1, '_id.month': 1}}
        ]);
        const monthlyRevenue = last6.map(m => {
            const found = monthlyAgg.find(r => r._id.month === m.monthNum && r._id.year === m.year);
            return {month: m.month, revenue: found ? found.revenue : 0, orders: found ? found.orders : 0};
        });

        // ─── Orders by Status ────────────────────────────
        const statusAgg = await Order.aggregate([
            {$match: shopMatch},
            {$group: {_id: '$status', count: {$sum: 1}}}
        ]);
        const ordersByStatus = {pending: 0, delivering: 0, completed: 0, cancelled: 0, processing: 0, shipped: 0, delivered: 0};
        statusAgg.forEach(s => { if (ordersByStatus[s._id] !== undefined) ordersByStatus[s._id] = s.count; });

        // ─── Top Products ────────────────────────────────
        const topProducts = await Order.aggregate([
            {$match: shopMatch},
            {$unwind: '$items'},
            {$group: {_id: '$items.product', sales: {$sum: '$items.quantity'}, revenue: {$sum: {$multiply: ['$items.quantity', {$ifNull: ['$items.price', 0]}]}}}},
            {$sort: {sales: -1}},
            {$limit: 5},
            {$lookup: {from: 'products', localField: '_id', foreignField: '_id', as: 'product'}},
            {$unwind: '$product'},
            {$project: {name: '$product.name', sales: 1, revenue: 1}}
        ]);

        // ─── Recent Orders ───────────────────────────────
        const recentOrders = await Order.find(shopMatch)
            .sort({createdAt: -1}).limit(10)
            .populate({path: 'user', select: 'firstName lastName fullName'})
            .populate({path: 'shop', select: 'name'})
            .select('orderNumber price status createdAt');

        // ─── Revenue by Variant ──────────────────────────
        const variantAgg = await Order.aggregate([
            {$match: {...shopMatch, status: {$in: ['completed', 'delivered']}}},
            {$unwind: '$items'},
            {$lookup: {from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod'}},
            {$unwind: '$prod'},
            {$group: {_id: '$prod.variant', total: {$sum: {$multiply: ['$items.quantity', {$ifNull: ['$items.price', 0]}]}}}}
        ]);
        const revenueByVariant = {};
        variantAgg.forEach(v => { revenueByVariant[v._id || 'other'] = v.total; });

        // ─── Customer Growth (monthly new customers) ─────
        const custGrowthAgg = await Order.aggregate([
            {$match: {...shopMatch, createdAt: {$gte: sixMonthsAgo}}},
            {$group: {_id: {user: '$user', month: {$month: '$createdAt'}, year: {$year: '$createdAt'}}}},
            {$group: {_id: {month: '$_id.month', year: '$_id.year'}, customers: {$sum: 1}}}
        ]);
        const customerGrowth = last6.map(m => {
            const found = custGrowthAgg.find(r => r._id.month === m.monthNum && r._id.year === m.year);
            return {month: m.month, customers: found ? found.customers : 0};
        });

        // ─── Shops summary ───────────────────────────────
        const activeShops = allShops.filter(s => s.status === 'active').length;
        const avgRatingAgg = await Shop.aggregate([
            {$match: {owner: req.user._id, 'rating.count': {$gt: 0}}},
            {$group: {_id: null, avg: {$avg: '$rating.average'}}}
        ]);

        // ─── Disputes ────────────────────────────────────
        const [openDisputes, resolvedDisputes] = await Promise.all([
            Conflict.countDocuments({vendor: req.user._id, status: {$in: ['open', 'under_review', 'awaiting_vendor', 'escalated']}}),
            Conflict.countDocuments({vendor: req.user._id, status: {$in: ['resolved', 'closed']}})
        ]);

        // ─── Payment/delivery stats ──────────────────────
        const pendingPayoutsAgg = await Payment.aggregate([
            {$match: {user: req.user._id, status: 'pending'}},
            {$group: {_id: null, total: {$sum: '$price.amount'}}}
        ]);
        const deliveryZones = await Shop.aggregate([
            {$match: {owner: req.user._id}},
            {$unwind: '$destinations'},
            {$group: {_id: '$destinations.name'}},
            {$count: 'total'}
        ]);
        const paymentConfigured = allShops.filter(s => s.paymentDetails?.bankName || s.paymentDetails?.mobileMoneyNumber).length;

        res.status(200).json({
            message: 'Dashboard stats retrieved successfully',
            data: {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalCustomers,
                revenueChange,
                ordersChange,
                productsChange,
                customersChange,
                monthlyRevenue,
                ordersByStatus,
                topProducts,
                recentOrders,
                revenueByVariant,
                customerGrowth,
                totalShops: allShops.length,
                activeShops,
                averageRating: Math.round((avgRatingAgg[0]?.avg || 0) * 10) / 10,
                totalDeliveryZones: deliveryZones[0]?.total || 0,
                paymentMethodsConfigured: paymentConfigured,
                pendingPayouts: pendingPayoutsAgg[0]?.total || 0,
                openDisputes,
                resolvedDisputes
            }
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getDashboard = async (req, res) => {
    return exports.getStats(req, res);
}


exports.getAnalytics = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);

        const {startDate, endDate} = req.query;
        const dateMatch = {shop: {$in: shopIds}};
        if (startDate || endDate) {
            dateMatch['createdAt'] = {};
            if (startDate) dateMatch['createdAt']['$gte'] = new Date(startDate);
            if (endDate) dateMatch['createdAt']['$lte'] = new Date(endDate);
        }

        const ordersByDate = await Order.aggregate([
            {$match: dateMatch},
            {$group: {
                _id: {$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}},
                count: {$sum: 1},
                revenue: {$sum: '$price.amount'}
            }},
            {$sort: {_id: 1}}
        ]);

        const topProducts = await Order.aggregate([
            {$match: dateMatch},
            {$unwind: '$items'},
            {$group: {_id: '$items.product', totalQuantity: {$sum: '$items.quantity'}, orderCount: {$sum: 1}}},
            {$sort: {totalQuantity: -1}},
            {$limit: 10},
            {$lookup: {from: 'products', localField: '_id', foreignField: '_id', as: 'product'}},
            {$unwind: '$product'},
            {$project: {'product.name': 1, 'product.image': 1, 'product.price': 1, totalQuantity: 1, orderCount: 1}}
        ]);

        const visitsByDate = await ShopVisit.aggregate([
            {$match: {shop: {$in: shopIds}, ...(startDate || endDate ? {createdAt: dateMatch.createdAt} : {})}},
            {$group: {
                _id: {$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}},
                count: {$sum: 1}
            }},
            {$sort: {_id: 1}}
        ]);

        res.status(200).json({
            message: 'Analytics retrieved successfully',
            data: {ordersByDate, topProducts, visitsByDate}
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getRecentOrders = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const orders = await Order.find({shop: {$in: shopIds}})
            .sort({createdAt: -1}).limit(10)
            .populate({path: 'user', select: 'firstName lastName fullName email phone'})
            .populate({path: 'shop', select: 'name'})
            .populate({path: 'items.product', select: 'name image price'});
        res.status(200).json({message: 'Recent orders retrieved', data: orders});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getTopProducts = async (req, res) => {
    try {
        const shops = await Shop.find({owner: req.user._id}).select('_id');
        const shopIds = shops.map(s => s._id);
        const topProducts = await Order.aggregate([
            {$match: {shop: {$in: shopIds}}},
            {$unwind: '$items'},
            {$group: {_id: '$items.product', totalQuantity: {$sum: '$items.quantity'}, orderCount: {$sum: 1}}},
            {$sort: {totalQuantity: -1}},
            {$limit: 10},
            {$lookup: {from: 'products', localField: '_id', foreignField: '_id', as: 'product'}},
            {$unwind: '$product'},
            {$project: {'product.name': 1, 'product.image': 1, 'product.price': 1, 'product.variant': 1, totalQuantity: 1, orderCount: 1}}
        ]);
        res.status(200).json({message: 'Top products retrieved', data: topProducts});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
