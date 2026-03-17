const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/v1/user");
const Admin = require("./models/v1/admin");
const Shop = require("./models/v1/shop");
const Product = require("./models/v1/product");
const Order = require("./models/v1/order");
const Review = require("./models/v1/review");
const ShopReview = require("./models/v1/shop-review");
const Payment = require("./models/v1/payment");
const Testimonial = require("./models/v1/testimonial");
const FAQ = require("./models/v1/faq");
const Message = require("./models/v1/message");
const Blog = require("./models/v1/blog");
const Coupon = require("./models/v1/coupon");
const Newsletter = require("./models/v1/newsletter");
const Wishlist = require("./models/v1/wishlist");
const Address = require("./models/v1/address");
const PaymentMethod = require("./models/v1/payment-method");
const ShopVisit = require("./models/v1/shop-visit");
const Promotion = require("./models/v1/promotion");
const Batch = require("./models/v1/batch");
const License = require("./models/v1/license");
const AuditLog = require("./models/v1/audit-log");
const Dispensary = require("./models/v1/dispensary");
const Referral = require("./models/v1/referral");
const Settings = require("./models/v1/settings");

const MONGO_URI = process.env.MONGO_DB_URI;
const PASSWORD = "Test@1234";
const PIN = "1234";

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB. Seeding...");

    // Clear all collections and drop problematic indexes
    await Promise.all([
        User.deleteMany(), Admin.deleteMany(), Shop.deleteMany(), Product.deleteMany(),
        Order.deleteMany(), Review.deleteMany(), ShopReview.deleteMany(), Payment.deleteMany(),
        Testimonial.deleteMany(), FAQ.deleteMany(), Message.deleteMany(), Blog.deleteMany(),
        Coupon.deleteMany(), Newsletter.deleteMany(), Wishlist.deleteMany(), Address.deleteMany(),
        PaymentMethod.deleteMany(), ShopVisit.deleteMany(), Promotion.deleteMany(),
        Batch.deleteMany(), License.deleteMany(), AuditLog.deleteMany(),
        Dispensary.deleteMany(), Referral.deleteMany(), Settings.deleteMany()
    ]);
    // Drop stale unique indexes on subdocument arrays
    try { await Review.collection.dropIndexes(); } catch (e) {}
    try { await ShopReview.collection.dropIndexes(); } catch (e) {}
    try { await Order.collection.dropIndexes(); } catch (e) {}
    try { await Coupon.collection.dropIndexes(); } catch (e) {}
    console.log("Cleared all collections.");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    const hashedPin = await bcrypt.hash(PIN, 10);

    // ─── ADMINS ──────────────────────────────────────────
    const adminsData = [
        {firstName: "Stanley", lastName: "Hayford", username: "shayford", email: "sahayford@ruderalis.com", phone: "+233541000001", role: "super-admin"},
        {firstName: "Sarah", lastName: "Mitchell", username: "sarahm", email: "sarah@ruderalis.com", phone: "+233541000002", role: "admin"},
        {firstName: "Marcus", lastName: "Thompson", username: "marcust", email: "marcus@ruderalis.com", phone: "+233541000003", role: "admin"},
    ];

    const admins = await Admin.insertMany(adminsData.map(a => ({
        ...a, fullName: `${a.firstName} ${a.lastName}`,
        password: hashedPassword, pin: hashedPin, status: "active",
        permissions: undefined // defaults apply
    })));
    console.log(`Created ${admins.length} admins`);

    // ─── VENDORS ─────────────────────────────────────────
    const vendorPerms = {
        product: {create: true, read: true, update: true, remove: true},
        shop: {create: true, read: true, update: true, remove: true},
        testimonial: {create: true, read: true, update: true, remove: true},
        order: {create: true, read: true, update: true, remove: true},
        review: {create: true, read: true, update: true, remove: true},
        shopReview: {create: true, read: true, update: true, remove: true},
        message: {create: true, read: true, update: true, remove: true},
        payment: {create: true, read: true, update: true, remove: true},
        contact: {create: true, read: true, update: true, remove: true},
        chat: {create: true, read: true, update: true, remove: true},
        authentication: {register: true, login: true, updateProfile: true, getProfile: true, changePin: true, resetPin: true, resetPassword: true, changePassword: true, deleteProfile: true}
    };

    const vendorsData = [
        {firstName: "Kwame", lastName: "Asante", username: "kwameasante", email: "kwame@greenleaf.com", phone: "+233541000010"},
        {firstName: "Ama", lastName: "Mensah", username: "amamensah", email: "ama@herbalwellness.com", phone: "+233541000011"},
        {firstName: "Kofi", lastName: "Boateng", username: "kofiboat", email: "kofi@cannabiscorner.com", phone: "+233541000012"},
        {firstName: "Akua", lastName: "Owusu", username: "akuaowusu", email: "akua@purekush.com", phone: "+233541000013"},
        {firstName: "Yaw", lastName: "Darko", username: "yawdarko", email: "yaw@medileaf.com", phone: "+233541000014"},
    ];

    const vendors = await User.insertMany(vendorsData.map(v => ({
        ...v, fullName: `${v.firstName} ${v.lastName}`,
        password: hashedPassword, pin: hashedPin, status: "active", role: "vendor",
        permissions: vendorPerms
    })));
    console.log(`Created ${vendors.length} vendors`);

    // ─── CLIENTS ─────────────────────────────────────────
    const clientPerms = {
        product: {create: false, read: true, update: false, remove: false},
        shop: {create: false, read: true, update: false, remove: false},
        testimonial: {create: true, read: true, update: true, remove: true},
        order: {create: true, read: true, update: true, remove: false},
        review: {create: true, read: true, update: true, remove: true},
        shopReview: {create: true, read: true, update: true, remove: true},
        message: {create: true, read: true, update: false, remove: false},
        payment: {create: true, read: true, update: false, remove: false},
        contact: {create: true, read: true, update: false, remove: false},
        chat: {create: true, read: true, update: false, remove: false},
        authentication: {register: true, login: true, updateProfile: true, getProfile: true, changePin: true, resetPin: true, resetPassword: true, changePassword: true, deleteProfile: true}
    };

    const firstNames = ["John", "Sarah", "Mike", "Emily", "Robert", "Lisa", "David", "Amanda", "Chris", "Jessica", "Daniel", "Michelle", "James", "Angela", "Brian", "Sophia", "Kevin", "Olivia", "Eric", "Rachel"];
    const lastNames = ["Smith", "Johnson", "Davis", "Chen", "Wilson", "Brown", "Garcia", "Patel", "Anderson", "White", "Lee", "Taylor", "Thomas", "Harris", "Martin", "Jackson", "Moore", "Clark", "Lewis", "Walker"];

    const clientsData = firstNames.map((fn, i) => ({
        firstName: fn, lastName: lastNames[i],
        username: `${fn.toLowerCase()}${lastNames[i].toLowerCase()}`,
        email: `${fn.toLowerCase()}.${lastNames[i].toLowerCase()}@email.com`,
        phone: `+233${540000020 + i}`,
        fullName: `${fn} ${lastNames[i]}`,
        password: hashedPassword, pin: hashedPin, status: "active", role: "user",
        permissions: clientPerms,
        address: {
            country: "Ghana", region: rand(["Greater Accra", "Ashanti", "Western", "Eastern", "Central"]),
            city: rand(["Accra", "Kumasi", "Takoradi", "Cape Coast", "Tamale", "Ho", "Sunyani"]),
            street: `${randInt(1, 500)} ${rand(["Oxford St", "Independence Ave", "Kojo Thompson Rd", "Ring Rd", "High St", "Cantonments Rd"])}`,
            gpAddressOrHouseNumber: `GA-${randInt(100, 999)}-${randInt(1000, 9999)}`
        }
    }));

    const clients = await User.insertMany(clientsData);
    console.log(`Created ${clients.length} clients`);

    // ─── SHOPS ───────────────────────────────────────────
    const shopNames = [
        "Green Leaf Dispensary", "Herbal Wellness Center", "Cannabis Corner",
        "Pure Kush Collective", "MediLeaf Ghana", "Accra Green House",
        "Kush Kingdom", "Healing Herbs Dispensary"
    ];

    const shopsData = shopNames.map((name, i) => ({
        name,
        owner: vendors[i % vendors.length]._id,
        contact: {phone: `+233${550000001 + i}`, email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`},
        description: `Premium medical marijuana dispensary offering the finest selection of cannabis products. Licensed and compliant with all regulations. ${name} is your trusted source for quality strains, edibles, and accessories.`,
        status: "active",
        image: `https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=300&fit=crop&q=80&sig=${i}`,
        rank: randInt(1, 20),
        featured: {value: i < 3, startDate: daysAgo(30), endDate: daysAgo(-60)},
        destinations: [
            {name: "Accra", price: {amount: randInt(5, 15), currency: "GHS"}},
            {name: "Kumasi", price: {amount: randInt(15, 30), currency: "GHS"}},
            {name: "Takoradi", price: {amount: randInt(20, 40), currency: "GHS"}}
        ],
        operatingHours: {open: "09:00", close: "21:00"},
        license: `MJ-GH-${2025}-${String(i + 1).padStart(3, '0')}`,
        paymentDetails: {
            bankName: rand(["GCB Bank", "Ecobank", "Stanbic Bank", "Fidelity Bank"]),
            accountNumber: `****${randInt(1000, 9999)}`,
            accountName: shopNames[i],
            mobileMoneyProvider: rand(["mtn", "vodafone", "airtelTigo"]),
            mobileMoneyNumber: `0${rand(["24", "54", "55", "20"])}${randInt(1000000, 9999999)}`
        },
        shippingRates: [
            {name: "Standard Delivery", price: 10, estimatedDays: "3-5 days", currency: "GHS"},
            {name: "Express Delivery", price: 25, estimatedDays: "1-2 days", currency: "GHS"},
            {name: "Free Pickup", price: 0, estimatedDays: "Same day", currency: "GHS"}
        ],
        address: {
            street: `${randInt(1, 200)} ${rand(["Oxford St", "Independence Ave", "Kojo Thompson Rd"])}`,
            city: rand(["Accra", "Kumasi", "Takoradi"]),
            state: rand(["Greater Accra", "Ashanti", "Western"]),
            country: "Ghana"
        },
        rating: {average: randFloat(3.5, 5.0, 1), count: randInt(10, 200), details: {five: randInt(5, 100), four: randInt(5, 50), three: randInt(1, 20), two: randInt(0, 5), one: randInt(0, 3)}}
    }));

    const shops = await Shop.insertMany(shopsData);
    console.log(`Created ${shops.length} shops`);

    // ─── PRODUCTS ────────────────────────────────────────
    const productTemplates = [
        {name: "Purple Haze", variant: "flower", strain: "sativa", thc: 22.5, cbd: 0.5, price: 35, weight: "3.5g", category: "Flower"},
        {name: "OG Kush", variant: "flower", strain: "indica", thc: 25.0, cbd: 0.3, price: 40, weight: "3.5g", category: "Flower"},
        {name: "Blue Dream", variant: "flower", strain: "hybrid", thc: 21.5, cbd: 0.2, price: 45, weight: "3.5g", category: "Flower"},
        {name: "Sour Diesel", variant: "flower", strain: "sativa", thc: 19.8, cbd: 0.3, price: 42, weight: "3.5g", category: "Flower"},
        {name: "Girl Scout Cookies", variant: "flower", strain: "hybrid", thc: 25.0, cbd: 0.2, price: 55, weight: "3.5g", category: "Flower"},
        {name: "Granddaddy Purple", variant: "flower", strain: "indica", thc: 20.5, cbd: 0.1, price: 48, weight: "3.5g", category: "Flower"},
        {name: "Northern Lights", variant: "flower", strain: "indica", thc: 18.0, cbd: 0.5, price: 40, weight: "3.5g", category: "Flower"},
        {name: "Jack Herer", variant: "flower", strain: "sativa", thc: 22.0, cbd: 0.1, price: 47, weight: "3.5g", category: "Flower"},
        {name: "White Widow", variant: "flower", strain: "hybrid", thc: 20.0, cbd: 0.8, price: 43, weight: "3.5g", category: "Flower"},
        {name: "Gorilla Glue #4", variant: "flower", strain: "hybrid", thc: 28.0, cbd: 0.1, price: 52, weight: "3.5g", category: "Flower"},
        {name: "THC Gummies - Mixed Fruit", variant: "edible", strain: "hybrid", thc: 10.0, cbd: 0.0, price: 25, weight: "100mg", category: "Edibles"},
        {name: "CBD:THC Chocolate Bar", variant: "edible", strain: "hybrid", thc: 5.0, cbd: 5.0, price: 18, weight: "100mg", category: "Edibles"},
        {name: "Cannabis Cookies", variant: "edible", strain: "indica", thc: 15.0, cbd: 0.0, price: 20, weight: "150mg", category: "Edibles"},
        {name: "THC Honey Sticks", variant: "edible", strain: "sativa", thc: 10.0, cbd: 2.0, price: 15, weight: "50mg", category: "Edibles"},
        {name: "Brownie Bites - Indica", variant: "edible", strain: "indica", thc: 25.0, cbd: 0.0, price: 22, weight: "125mg", category: "Edibles"},
        {name: "Mango CBD Gummies", variant: "edible", strain: "cbd", thc: 0.5, cbd: 25.0, price: 30, weight: "250mg", category: "Edibles"},
        {name: "Live Resin - Lemon Haze", variant: "concentrate", strain: "sativa", thc: 78.5, cbd: 0.5, price: 65, weight: "1g", category: "Concentrates"},
        {name: "Shatter - Wedding Cake", variant: "concentrate", strain: "hybrid", thc: 82.0, cbd: 0.3, price: 55, weight: "1g", category: "Concentrates"},
        {name: "RSO Syringe", variant: "concentrate", strain: "indica", thc: 70.0, cbd: 5.0, price: 50, weight: "1g", category: "Concentrates"},
        {name: "Pain Relief Cream", variant: "topical", strain: "cbd", thc: 1.0, cbd: 50.0, price: 35, weight: "100ml", category: "Topicals"},
        {name: "Bath Bomb - Lavender CBD", variant: "topical", strain: "cbd", thc: 0.0, cbd: 100.0, price: 15, weight: "1pc", category: "Topicals"},
        {name: "Muscle Rub - Deep Heat", variant: "topical", strain: "hybrid", thc: 5.0, cbd: 30.0, price: 28, weight: "50ml", category: "Topicals"},
        {name: "Pre-Roll Pack - Sativa Blend", variant: "pre-roll", strain: "sativa", thc: 18.0, cbd: 0.2, price: 30, weight: "3.5g (5x0.7g)", category: "Pre-Rolls"},
        {name: "Pre-Roll - Indica Nightcap", variant: "pre-roll", strain: "indica", thc: 22.0, cbd: 0.5, price: 8, weight: "1g", category: "Pre-Rolls"},
        {name: "Full Spectrum Tincture", variant: "tincture", strain: "hybrid", thc: 15.0, cbd: 15.0, price: 40, weight: "30ml", category: "Tinctures"},
        {name: "CBD Sleep Tincture", variant: "tincture", strain: "cbd", thc: 1.0, cbd: 30.0, price: 35, weight: "30ml", category: "Tinctures"},
        {name: "Vape Cart - Gelato", variant: "vape", strain: "hybrid", thc: 85.0, cbd: 0.0, price: 45, weight: "1g", category: "Vapes"},
        {name: "Disposable Vape - Pineapple Express", variant: "vape", strain: "sativa", thc: 75.0, cbd: 0.0, price: 35, weight: "0.5g", category: "Vapes"},
        {name: "Glass Pipe - Artisan", variant: "accessory", strain: "", thc: 0, cbd: 0, price: 28, weight: "", category: "Accessories"},
        {name: "Rolling Papers - King Size", variant: "accessory", strain: "", thc: 0, cbd: 0, price: 5, weight: "", category: "Accessories"},
        {name: "Herb Grinder - Premium", variant: "accessory", strain: "", thc: 0, cbd: 0, price: 22, weight: "", category: "Accessories"},
        {name: "Stash Jar - Smell Proof", variant: "accessory", strain: "", thc: 0, cbd: 0, price: 15, weight: "", category: "Accessories"},
    ];

    const productsData = [];
    for (const shop of shops) {
        const numProducts = randInt(8, 15);
        const shuffled = [...productTemplates].sort(() => Math.random() - 0.5).slice(0, numProducts);
        for (const tmpl of shuffled) {
            productsData.push({
                name: tmpl.name,
                owner: shop.owner,
                shop: shop._id,
                status: rand(["active", "active", "active", "active", "pending"]),
                stock: {available: true, quantity: randInt(0, 500)},
                price: {amount: tmpl.price + randInt(-5, 10), currency: "GHS"},
                description: `Premium ${tmpl.name}. ${tmpl.category} product from ${shop.name}. THC: ${tmpl.thc}% | CBD: ${tmpl.cbd}%`,
                image: `https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=400&h=300&fit=crop&q=80&sig=${productsData.length}`,
                variant: tmpl.variant,
                category: tmpl.category,
                strain: tmpl.strain,
                thc: tmpl.thc,
                cbd: tmpl.cbd,
                weight: tmpl.weight,
                sku: `${tmpl.variant.substring(0, 2).toUpperCase()}-${String(productsData.length + 1).padStart(3, '0')}`,
                rank: randInt(1, 10),
                featured: {status: Math.random() < 0.2, startDate: daysAgo(30), endDate: daysAgo(-60)},
                sale: Math.random() < 0.15 ? {status: true, startDate: daysAgo(10), endDate: daysAgo(-20), price: {amount: Math.round(tmpl.price * 0.8), currency: "GHS"}} : {status: false},
                metadata: {[tmpl.variant]: {strain: tmpl.strain, thc: tmpl.thc, cbd: tmpl.cbd}},
                rating: {average: randFloat(3.0, 5.0, 1), count: randInt(0, 100), details: {five: randInt(0, 50), four: randInt(0, 30), three: randInt(0, 15), two: randInt(0, 5), one: randInt(0, 3)}}
            });
        }
    }

    const products = await Product.insertMany(productsData);
    console.log(`Created ${products.length} products`);

    // ─── ORDERS ──────────────────────────────────────────
    const statuses = ["pending", "processing", "shipped", "delivered", "delivered", "delivered", "completed", "completed", "cancelled"];
    const payMethods = ["mobile_money", "credit_card", "debit_card", "cash"];
    const ordersData = [];

    for (let i = 0; i < 150; i++) {
        const client = rand(clients);
        const shop = rand(shops);
        const shopProducts = products.filter(p => p.shop.toString() === shop._id.toString());
        if (!shopProducts.length) continue;
        const numItems = randInt(1, 4);
        const items = [];
        const used = new Set();
        for (let j = 0; j < numItems; j++) {
            const prod = rand(shopProducts);
            if (used.has(prod._id.toString())) continue;
            used.add(prod._id.toString());
            const qty = randInt(1, 3);
            items.push({product: prod._id, quantity: qty, price: prod.price.amount});
        }
        if (!items.length) continue;
        const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        const tax = Math.round(subtotal * 0.1);
        const shipping = rand([0, 5, 10, 15, 25]);
        const status = rand(statuses);
        const payStatus = status === "cancelled" ? "refunded" : status === "pending" ? "pending" : "paid";

        ordersData.push({
            orderNumber: `#RUD-2026-${String(ordersData.length + 1).padStart(3, '0')}`,
            status, shop: shop._id, user: client._id, items,
            price: {amount: subtotal + tax + shipping, currency: "GHS"},
            subtotal, tax, shipping,
            destination: `${client.address.street}, ${client.address.city}`,
            shippingAddress: {street: client.address.street, city: client.address.city, state: client.address.region, country: "Ghana"},
            paymentMethod: rand(payMethods),
            paymentStatus: payStatus,
            notes: Math.random() < 0.3 ? rand(["Leave at front door", "Call before delivery", "Ring bell twice", "Fragile items", ""]) : "",
            createdAt: daysAgo(randInt(0, 90)),
        });
    }

    const orders = await Order.insertMany(ordersData);
    console.log(`Created ${orders.length} orders`);

    // ─── REVIEWS ─────────────────────────────────────────
    const reviewTexts = [
        "Excellent quality! Will definitely order again.", "Great strain, very relaxing.", "Fast delivery and fresh product.",
        "Good value for the price.", "This is my go-to product now.", "Amazing effects, helped with my pain.",
        "Decent product, could be better packaged.", "Loved it! Perfect for evening use.", "Strong and effective. Highly recommend.",
        "Not my favorite but still good quality.", "Perfect for medical use. Very therapeutic.", "Best dispensary in town!",
        "Smooth smoke, great flavor profile.", "Helped me sleep like a baby.", "A bit pricey but worth it.",
        "Outstanding customer service with this order.", "Fresh and potent. No complaints!", "My daily medication, works wonders."
    ];

    const reviewsData = [];
    for (let i = 0; i < 200; i++) {
        const prod = rand(products);
        const client = rand(clients);
        reviewsData.push({
            user: client._id, product: prod._id,
            text: rand(reviewTexts), rating: randInt(3, 5),
            visible: Math.random() < 0.8,
            createdAt: daysAgo(randInt(0, 60))
        });
    }
    const reviews = await Review.insertMany(reviewsData);
    console.log(`Created ${reviews.length} reviews`);

    // ─── SHOP REVIEWS ────────────────────────────────────
    const shopReviewsData = [];
    for (let i = 0; i < 80; i++) {
        shopReviewsData.push({
            user: rand(clients)._id, shop: rand(shops)._id,
            text: rand(["Great dispensary!", "Friendly staff and quality products.", "Best prices in the area.", "Fast service.", "Always reliable.", "Love this shop!", "Clean and professional.", "Excellent selection."]),
            rating: randInt(3, 5), visible: Math.random() < 0.8,
            createdAt: daysAgo(randInt(0, 60))
        });
    }
    const shopReviews = await ShopReview.insertMany(shopReviewsData);
    console.log(`Created ${shopReviews.length} shop reviews`);

    // ─── PAYMENTS ────────────────────────────────────────
    const purposes = ["product-promotion", "store-promotion", "daily-payment", "monthly-payment", "store-setup", "product-setup"];
    const providers = ["mtn", "vodafone", "airtelTigo"];
    const paymentsData = [];
    for (let i = 0; i < 60; i++) {
        paymentsData.push({
            user: rand([...vendors, ...clients])._id,
            price: {amount: randInt(10, 500), currency: "GHS"},
            method: "mobile money",
            status: rand(["pending", "success", "success", "success", "failed"]),
            sender: {provider: rand(providers), number: `0${rand(["24", "54", "55"])}${randInt(1000000, 9999999)}`},
            recipient: {provider: rand(providers), number: `0${rand(["24", "54", "55"])}${randInt(1000000, 9999999)}`},
            transactionID: `TXN${Date.now()}${randInt(100, 999)}${i}`,
            purpose: rand(purposes),
            createdAt: daysAgo(randInt(0, 90))
        });
    }
    const payments = await Payment.insertMany(paymentsData);
    console.log(`Created ${payments.length} payments`);

    // ─── TESTIMONIALS ────────────────────────────────────
    const testimonialTexts = [
        "Ruderalis has completely changed how I manage my chronic pain. The quality and consistency are unmatched.",
        "I've been a loyal customer for over a year. The selection keeps getting better and the service is outstanding.",
        "As a medical patient, finding a reliable dispensary was crucial. Ruderalis exceeded all my expectations.",
        "The best platform for medical marijuana in Ghana. Convenient, safe, and professional.",
        "My doctor recommended trying medical cannabis and Ruderalis made the transition so easy and comfortable.",
        "Incredible quality products at fair prices. The vendors on this platform really care about their customers.",
        "From ordering to delivery, every step was smooth and professional. Highly recommended!",
        "The edibles selection is amazing. I found exactly what I needed for my anxiety management.",
        "Five stars isn't enough! The customer support team is responsive and genuinely helpful.",
        "Ruderalis has the most transparent lab testing information. I always know what I'm getting."
    ];

    const testimonialsData = testimonialTexts.map((text, i) => ({
        user: rand(clients)._id, text,
        rating: randInt(4, 5), visible: true,
        createdAt: daysAgo(randInt(0, 90))
    }));
    const testimonials = await Testimonial.insertMany(testimonialsData);
    console.log(`Created ${testimonials.length} testimonials`);

    // ─── FAQS ────────────────────────────────────────────
    const faqsData = [
        {question: "What is medical marijuana?", answer: "Medical marijuana refers to using the cannabis plant or its chemicals to treat diseases or conditions. It contains cannabinoids like THC and CBD that can help with pain, nausea, and other symptoms.", category: "General", order: 1},
        {question: "Do I need a prescription to order?", answer: "Yes, in compliance with regulations, you need a valid medical marijuana recommendation from a licensed healthcare provider. You can upload your documentation during registration.", category: "General", order: 2},
        {question: "How long does delivery take?", answer: "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 day shipping. Same-day pickup is available at select dispensary locations.", category: "Delivery", order: 3},
        {question: "What payment methods do you accept?", answer: "We accept mobile money (MTN, Vodafone, AirtelTigo), credit/debit cards, and cash on delivery at select locations.", category: "Payments", order: 4},
        {question: "Can I return a product?", answer: "Due to the nature of our products, we cannot accept returns on opened items. Unopened products can be returned within 7 days of delivery. Contact support for assistance.", category: "Returns", order: 5},
        {question: "How do I become a vendor?", answer: "Register as a vendor on our platform, submit your business license and required documentation. Our team will review and approve your application within 3-5 business days.", category: "Vendors", order: 6},
        {question: "Is my information kept confidential?", answer: "Absolutely. We use bank-level encryption and strict privacy policies. Your medical information and purchase history are never shared with third parties.", category: "Privacy", order: 7},
        {question: "What strains do you carry?", answer: "We carry a wide variety of strains including Sativa, Indica, and Hybrid varieties. Each product listing includes detailed THC/CBD percentages and strain information.", category: "Products", order: 8},
        {question: "How do I track my order?", answer: "After placing your order, you'll receive a tracking code. Use the tracking page to monitor your delivery status in real-time.", category: "Delivery", order: 9},
        {question: "What are your customer support hours?", answer: "Our support team is available Monday through Friday, 9 AM to 9 PM, and weekends 10 AM to 6 PM. You can reach us via the contact form, email, or phone.", category: "Support", order: 10},
    ];

    const faqs = await FAQ.insertMany(faqsData.map(f => ({...f, visible: true, createdBy: admins[0]._id})));
    console.log(`Created ${faqs.length} FAQs`);

    // ─── MESSAGES ────────────────────────────────────────
    const messagesData = [
        {user: clients[0]._id, subject: "Product Inquiry", text: "Hi, I wanted to ask about the availability of Purple Haze in larger quantities. Can I get a bulk discount?", status: "pending"},
        {user: clients[1]._id, subject: "Order Status", text: "Can you provide an update on my order? It has been in processing for a while now.", status: "read"},
        {user: clients[2]._id, subject: "Delivery Confirmation", text: "Just wanted to confirm that I received my order. Everything looks great, thanks!", status: "replied", reply: {text: "Thank you for confirming! We're glad everything arrived safely.", admin: admins[1]._id, repliedAt: daysAgo(1)}},
        {user: clients[3]._id, subject: "CBD Product Recommendations", text: "I am looking for CBD products for pain relief. Can you recommend something from your catalog?", status: "replied", reply: {text: "We recommend our Full Spectrum Tincture or Pain Relief Cream. Both are excellent for pain management.", admin: admins[1]._id, repliedAt: daysAgo(2)}},
        {user: clients[4]._id, subject: "Account Issue", text: "I'm having trouble updating my shipping address. Can you help?", status: "pending"},
        {user: clients[5]._id, subject: "Refund Request", text: "I received the wrong product in my last order. I'd like to request a refund or exchange.", status: "pending"},
        {user: clients[6]._id, subject: "Vendor Application", text: "I'm interested in selling on Ruderalis. What are the requirements and fees?", status: "read"},
        {user: clients[7]._id, subject: "Feedback", text: "Your platform is amazing! I love the variety of products and the fast delivery. Keep up the great work!", status: "replied", reply: {text: "Thank you so much for the kind words! We're always working to improve.", admin: admins[0]._id, repliedAt: daysAgo(3)}},
    ];
    const messages = await Message.insertMany(messagesData.map(m => ({...m, createdAt: daysAgo(randInt(0, 14))})));
    console.log(`Created ${messages.length} messages`);

    // ─── BLOGS ───────────────────────────────────────────
    const blogsData = [
        // Education
        {title: "Understanding Medical Marijuana: A Beginner's Guide", content: "Medical marijuana has been gaining recognition worldwide for its therapeutic benefits. This comprehensive guide covers everything you need to know about getting started with medical cannabis.\n\nThe cannabis plant contains over 100 different cannabinoids, but the two most well-known are THC (tetrahydrocannabinol) and CBD (cannabidiol). THC is the primary psychoactive compound responsible for the 'high' sensation, while CBD is non-psychoactive and is valued for its therapeutic properties.\n\n## How Medical Marijuana Works\n\nYour body has an endocannabinoid system (ECS) that plays a role in regulating sleep, mood, appetite, memory, and pain sensation. When you consume cannabis, the cannabinoids interact with receptors in your ECS, producing various therapeutic effects.\n\n## Getting Started\n\n1. **Consult a healthcare provider** - Discuss whether medical marijuana is right for your condition\n2. **Understand your options** - Flower, edibles, tinctures, topicals, and concentrates all offer different onset times and durations\n3. **Start low, go slow** - Begin with a low dose and gradually increase until you find relief\n4. **Keep a journal** - Track strains, doses, and effects to find what works best for you\n\n## Common Conditions Treated\n\n- Chronic pain and inflammation\n- Anxiety and PTSD\n- Insomnia and sleep disorders\n- Nausea from chemotherapy\n- Muscle spasticity from MS\n- Epilepsy and seizure disorders", summary: "Everything beginners need to know about medical marijuana, from cannabinoids to finding the right dosage.", category: "Education", tags: ["beginner", "guide", "medical", "cannabinoids"], visible: true},

        {title: "CBD vs THC: What's the Difference?", content: "CBD and THC are both cannabinoids found in the cannabis plant, but they have very different effects on the body and mind. Understanding these differences is crucial for choosing the right product for your needs.\n\n## THC (Tetrahydrocannabinol)\n\nTHC is the primary psychoactive compound in cannabis. It binds directly to CB1 receptors in the brain, producing:\n- Euphoria and altered perception\n- Pain relief\n- Appetite stimulation\n- Muscle relaxation\n- Sleep aid\n\n## CBD (Cannabidiol)\n\nCBD is non-psychoactive and works indirectly with the endocannabinoid system:\n- Anti-inflammatory properties\n- Anxiety reduction\n- Neuroprotective effects\n- Anti-seizure properties\n- No intoxicating effects\n\n## The Entourage Effect\n\nResearch suggests that CBD and THC work better together than alone. This synergistic interaction, known as the 'entourage effect,' means full-spectrum products containing both cannabinoids may provide enhanced therapeutic benefits.\n\n## Choosing the Right Ratio\n\n- **High THC, Low CBD** - Best for pain, insomnia, appetite\n- **Balanced THC:CBD** - Good for anxiety, inflammation, general wellness\n- **High CBD, Low THC** - Ideal for those who want therapeutic benefits without the high\n- **CBD Only** - For those who cannot tolerate any psychoactive effects", summary: "A comprehensive comparison of CBD and THC — effects, benefits, and how to choose the right ratio.", category: "Education", tags: ["cbd", "thc", "education", "cannabinoids"], visible: true},

        {title: "The Endocannabinoid System Explained", content: "Your body has a remarkable system that most people have never heard of — the endocannabinoid system (ECS). Discovered in the early 1990s, the ECS is one of the most important physiological systems involved in establishing and maintaining human health.\n\n## What Is the ECS?\n\nThe endocannabinoid system consists of three core components:\n1. **Endocannabinoids** - Molecules your body naturally produces (anandamide and 2-AG)\n2. **Receptors** - CB1 (primarily in the brain) and CB2 (primarily in the immune system)\n3. **Enzymes** - Break down endocannabinoids after they carry out their function\n\n## Functions Regulated by the ECS\n\nThe ECS helps regulate:\n- Pain and inflammation\n- Mood and anxiety\n- Sleep cycles\n- Appetite and metabolism\n- Immune function\n- Memory and learning\n- Reproductive system\n- Cardiovascular function\n\n## How Cannabis Interacts with the ECS\n\nWhen you consume cannabis, plant cannabinoids (phytocannabinoids) mimic the endocannabinoids your body naturally produces. THC binds directly to CB1 receptors, while CBD modulates the system indirectly, preventing the breakdown of your own endocannabinoids.\n\nThis is why cannabis can affect so many different bodily functions — it taps into a system that already exists to maintain balance (homeostasis) throughout your body.", summary: "How your body's endocannabinoid system works and why cannabis interacts with it.", category: "Education", tags: ["science", "ecs", "cannabinoids", "education"], visible: true},

        {title: "Terpenes: The Hidden Power Behind Cannabis Strains", content: "When you smell the piney aroma of Jack Herer or the citrusy sweetness of Lemon Haze, you are experiencing terpenes — aromatic compounds that do far more than just create pleasant scents.\n\n## What Are Terpenes?\n\nTerpenes are volatile aromatic molecules produced by many plants, including cannabis. They serve as natural defense mechanisms against pests and environmental stressors. In cannabis, over 200 different terpenes have been identified.\n\n## Major Cannabis Terpenes\n\n### Myrcene\n- **Aroma:** Earthy, musky, herbal\n- **Effects:** Sedating, relaxing, pain-relieving\n- **Found in:** Mangoes, lemongrass, hops\n- **Strains:** OG Kush, Blue Dream, Granddaddy Purple\n\n### Limonene\n- **Aroma:** Citrus, lemon, orange\n- **Effects:** Uplifting, stress-relieving, antibacterial\n- **Found in:** Citrus fruits, juniper, rosemary\n- **Strains:** Lemon Haze, Super Lemon OG, Do-Si-Dos\n\n### Pinene\n- **Aroma:** Pine, fresh, woodsy\n- **Effects:** Alertness, memory retention, anti-inflammatory\n- **Found in:** Pine needles, rosemary, basil\n- **Strains:** Jack Herer, Blue Dream, Snoop's Dream\n\n### Linalool\n- **Aroma:** Floral, lavender, spicy\n- **Effects:** Calming, anti-anxiety, sedative\n- **Found in:** Lavender, coriander, birch bark\n- **Strains:** Amnesia Haze, LA Confidential, Kosher Kush\n\n### Caryophyllene\n- **Aroma:** Spicy, peppery, woody\n- **Effects:** Anti-inflammatory, pain-relieving (binds to CB2 receptors)\n- **Found in:** Black pepper, cloves, cinnamon\n- **Strains:** GSC, Gorilla Glue, Bubba Kush\n\n## Why Terpenes Matter\n\nTerpenes contribute to the 'entourage effect' — working synergistically with cannabinoids to enhance therapeutic benefits. This is why two strains with identical THC percentages can produce vastly different effects.", summary: "Discover how terpenes shape the effects, aroma, and therapeutic benefits of different cannabis strains.", category: "Education", tags: ["terpenes", "science", "strains", "aroma"], visible: true},

        {title: "Cannabis Dosing Guide: Finding Your Sweet Spot", content: "One of the most common questions from new cannabis patients is 'how much should I take?' The answer depends on several factors, but following a structured approach can help you find your ideal dose safely.\n\n## The Golden Rule: Start Low, Go Slow\n\nEveryone's endocannabinoid system is different. Factors that affect your ideal dose include:\n- Body weight and metabolism\n- Tolerance level\n- The condition being treated\n- The consumption method\n- The product's potency\n\n## Dosing by Method\n\n### Smoking/Vaping\n- **Onset:** 1-5 minutes\n- **Duration:** 1-3 hours\n- **Start with:** 1 small puff, wait 15 minutes\n\n### Edibles\n- **Onset:** 30-90 minutes\n- **Duration:** 4-8 hours\n- **Start with:** 2.5-5mg THC\n- **Warning:** Do NOT take more if you do not feel effects within 1 hour\n\n### Tinctures\n- **Onset:** 15-45 minutes (sublingual)\n- **Duration:** 4-6 hours\n- **Start with:** 2.5mg THC or 5mg CBD\n\n### Topicals\n- **Onset:** 15-30 minutes\n- **Duration:** 2-4 hours\n- **Application:** Apply liberally to affected area\n\n## THC Dose Ranges\n\n| Dose | Level | Effects |\n|------|-------|--------|\n| 1-2.5mg | Microdose | Mild relief, no impairment |\n| 2.5-5mg | Low | Mild euphoria, symptom relief |\n| 5-15mg | Moderate | Strong relief, noticeable euphoria |\n| 15-30mg | High | Strong effects, experienced users |\n| 30mg+ | Very High | Only for high-tolerance patients |", summary: "A practical guide to finding the right cannabis dose for your needs, by consumption method.", category: "Education", tags: ["dosing", "guide", "beginner", "safety"], visible: true},

        // Strains
        {title: "Top 5 Strains for Pain Management", content: "Chronic pain affects over 1.5 billion people worldwide. As more patients turn to medical cannabis, certain strains have emerged as particularly effective for pain relief. Here are our top picks, backed by patient experience and cannabinoid profiles.\n\n## 1. OG Kush\n**Type:** Indica-dominant hybrid | **THC:** 23-25% | **CBD:** 0.1-0.3%\nThe king of pain relief strains. OG Kush delivers a heavy body high that melts away pain while keeping you mentally present. Rich in myrcene and caryophyllene terpenes, it targets both muscle tension and nerve pain.\n\n## 2. Blue Dream\n**Type:** Hybrid | **THC:** 21-22% | **CBD:** 0.2-2%\nPerfect for daytime pain management. Blue Dream provides full-body relaxation without heavy sedation, allowing you to function while managing chronic pain. Its balanced effects make it ideal for first-time patients.\n\n## 3. Granddaddy Purple\n**Type:** Indica | **THC:** 20-23% | **CBD:** 0.1%\nIdeal for nighttime pain relief and insomnia. GDP's grape-like aroma and deeply relaxing effects make it a go-to for patients dealing with severe pain that disrupts sleep.\n\n## 4. Harlequin\n**Type:** Sativa-dominant | **THC:** 7-15% | **CBD:** 8-16%\nFor patients who want pain relief without strong psychoactive effects. Harlequin's high CBD content provides anti-inflammatory and analgesic properties while the balanced THC offers mild euphoria.\n\n## 5. White Widow\n**Type:** Balanced hybrid | **THC:** 18-25% | **CBD:** 0.2%\nA classic strain known for its euphoric, energetic high that distracts from pain. White Widow is excellent for neuropathic pain and works well for both day and evening use.", summary: "The best cannabis strains for managing chronic pain, from heavy indicas to balanced hybrids.", category: "Strains", tags: ["pain", "strains", "medical", "chronic-pain"], visible: true},

        {title: "Best Sativa Strains for Daytime Productivity", content: "Not all cannabis makes you sleepy. Sativa-dominant strains are known for their energizing, uplifting effects that can enhance focus, creativity, and motivation. Here are the best sativas for staying productive.\n\n## 1. Jack Herer\nNamed after the legendary cannabis activist, Jack Herer is the quintessential daytime strain. It provides a clear-headed cerebral high with bursts of energy and creativity. THC: 18-24%.\n\n## 2. Durban Poison\nA pure sativa from South Africa, Durban Poison is like a cup of espresso for your brain. It delivers laser-like focus and sustained energy without anxiety. THC: 15-25%.\n\n## 3. Green Crack\nDon't let the name fool you — Green Crack is simply an incredibly energizing sativa. It provides a sharp mental buzz with an invigorating body high that keeps you moving all day. THC: 15-25%.\n\n## 4. Super Silver Haze\nA three-time Cannabis Cup winner, SSH delivers a long-lasting cerebral high paired with gentle body relaxation. Perfect for creative work and social activities. THC: 18-23%.\n\n## 5. Sour Diesel\nOne of the most iconic sativas, Sour Diesel provides dreamy, cerebral effects that fuel creativity and conversation. Its fast-acting effects make it perfect for morning use. THC: 20-25%.\n\n## Tips for Productive Cannabis Use\n- Use sativas exclusively during the day\n- Microdose (1-2.5mg) for focus without impairment\n- Keep a strain journal to track which works best\n- Pair with coffee for an enhanced creative boost", summary: "Discover the best sativa strains that boost energy, creativity, and focus for productive days.", category: "Strains", tags: ["sativa", "productivity", "energy", "focus"], visible: true},

        {title: "Indica Strains for Sleep and Relaxation", content: "If counting sheep isn't working, certain indica strains might be your answer. Indica-dominant varieties are renowned for their sedating, full-body effects that promote deep relaxation and restful sleep.\n\n## Why Indica for Sleep?\n\nIndica strains typically contain higher levels of myrcene, a terpene known for its sedative properties. Combined with THC's ability to reduce the time it takes to fall asleep and increase overall sleep duration, indicas are nature's sleep aid.\n\n## Top Indica Strains for Sleep\n\n### Northern Lights\nThe gold standard for sleep strains. Northern Lights wraps you in a warm blanket of relaxation, easing both mind and body into a peaceful slumber. THC: 16-21%.\n\n### Granddaddy Purple (GDP)\nWith its sweet grape aroma and potent body high, GDP is a heavy hitter that's perfect for those who struggle with severe insomnia. The combination of myrcene and linalool makes it exceptionally sedating. THC: 20-23%.\n\n### Purple Kush\nA pure indica with a 100% sedation guarantee. Purple Kush delivers a slow, creeping high that gradually transitions into deep, restorative sleep. THC: 17-22%.\n\n### Bubba Kush\nKnown for its heavy tranquilizing effects, Bubba Kush is for those nights when nothing else works. Its earthy, coffee-like flavor pairs with profound physical relaxation. THC: 15-22%.\n\n### 9 Pound Hammer\nAs the name suggests, this strain hits hard. A cross of Gooberry, Hells OG, and Jack the Ripper, it produces immediate sedation and is best used right before bed. THC: 18-23%.\n\n## Sleep Hygiene Tips\n- Take your dose 30-60 minutes before bedtime\n- Edibles provide longer-lasting effects for staying asleep\n- Keep your bedroom cool, dark, and quiet\n- Avoid screens for 30 minutes after dosing", summary: "The best indica strains for combating insomnia and achieving deep, restful sleep.", category: "Strains", tags: ["indica", "sleep", "insomnia", "relaxation"], visible: true},

        {title: "Hybrid Strains: The Best of Both Worlds", content: "Hybrid cannabis strains combine the genetics of indica and sativa plants, creating unique effects that offer the best qualities of both. Whether you need balanced relief or a specific effect profile, there's a hybrid for you.\n\n## What Makes a Hybrid?\n\nBreeders cross indica and sativa genetics to create hybrids with specific characteristics:\n- **Indica-dominant hybrids** lean toward body relaxation with some mental stimulation\n- **Sativa-dominant hybrids** lean toward cerebral effects with some physical relaxation\n- **Balanced hybrids** offer equal parts mental and physical effects\n\n## Must-Try Hybrids\n\n### Blue Dream (Sativa-dominant)\nThe most popular strain in many markets. Delivers sweet berry flavor, full-body relaxation, and gentle cerebral invigoration. Perfect for beginners. THC: 21%.\n\n### Girl Scout Cookies (Balanced)\nFull-body euphoria meets time-warping cerebral highs. Sweet and earthy with powerful effects that satisfy both recreational and medical users. THC: 25%.\n\n### Gorilla Glue #4 (Indica-dominant)\nAward-winning hybrid delivering heavy-handed euphoria. Its name comes from the resin that literally glues your scissors shut during trimming. THC: 25-28%.\n\n### Wedding Cake (Indica-dominant)\nRich and tangy with undertones of earthy pepper. Provides relaxing and euphoric effects with a creative spark. Excellent for anxiety and pain. THC: 24-25%.\n\n### Pineapple Express (Sativa-dominant)\nFamous beyond the movie, this strain provides a long-lasting energetic buzz combined with a productive, creative high. Tropical aroma with hints of apple and mango. THC: 17-24%.", summary: "Understanding hybrid cannabis strains and the top varieties that blend indica and sativa effects.", category: "Strains", tags: ["hybrid", "strains", "balanced", "popular"], visible: true},

        // Industry & Trends
        {title: "The Rise of Cannabis Edibles in Africa", content: "The edibles market in Africa is experiencing unprecedented growth, driven by changing regulations, entrepreneurial innovation, and a growing awareness of cannabis as medicine.\n\n## Market Overview\n\nAfrica's cannabis edibles market is projected to reach significant value by 2030. Countries like Ghana, South Africa, Lesotho, and Zimbabwe are leading the charge with progressive cannabis legislation.\n\n## Popular Edible Formats\n\n### Gummies\nThe most popular edible format globally, gummies offer precise dosing, discreet consumption, and a wide variety of flavors. African producers are incorporating local flavors like mango, passion fruit, and baobab.\n\n### Chocolates\nCannabis-infused chocolate bars are premium products that appeal to both medical patients and wellness consumers. Local chocolatiers are partnering with licensed producers.\n\n### Beverages\nCannabis-infused drinks represent the fastest-growing segment. From teas to sparkling waters, beverages offer fast absorption and social consumption options.\n\n### Traditional Foods\nInnovative producers are infusing cannabis into traditional African foods and snacks, creating culturally relevant products that resonate with local consumers.\n\n## Challenges and Opportunities\n\n- **Regulation:** Navigating varying laws across African nations\n- **Education:** Combating stigma and misinformation\n- **Quality Control:** Establishing consistent dosing and testing standards\n- **Distribution:** Building cold chain logistics for perishable products\n\nThe future is bright for African cannabis edibles as the continent positions itself as a global player in the industry.", summary: "How cannabis edibles are transforming the African market with local innovation and flavors.", category: "Industry", tags: ["edibles", "africa", "trends", "market"], visible: true},

        {title: "Ghana's Medical Marijuana Industry: A 2026 Outlook", content: "Ghana is rapidly emerging as a key player in Africa's cannabis industry. With progressive legislation and a growing domestic market, the country is attracting both local entrepreneurs and international investors.\n\n## Regulatory Landscape\n\nGhana's Narcotics Control Commission has been working on frameworks to regulate medical cannabis cultivation, processing, and distribution. The focus is on:\n- Licensed cultivation facilities\n- Quality testing and certification\n- Medical dispensary regulations\n- Import/export guidelines\n\n## Economic Impact\n\n### Job Creation\nThe industry is expected to create thousands of jobs across the value chain — from farming and processing to retail and delivery services.\n\n### Revenue Generation\nTax revenue from cannabis sales could significantly contribute to national healthcare and education budgets.\n\n### International Trade\nGhana's tropical climate makes it ideal for cannabis cultivation, positioning the country as a potential exporter to European and North American markets.\n\n## Key Players\n\nSeveral companies are positioning themselves as leaders:\n- Licensed dispensaries in Accra and Kumasi\n- Processing facilities in the Western Region\n- Tech platforms connecting patients with vendors\n\n## Challenges\n\n- Social stigma remains a significant barrier\n- Banking services for cannabis businesses are limited\n- Infrastructure for testing and quality control is developing\n- International regulatory alignment is ongoing\n\nDespite challenges, Ghana's cannabis industry is on a trajectory of significant growth.", summary: "An overview of Ghana's emerging medical marijuana industry and its economic potential.", category: "Industry", tags: ["ghana", "industry", "regulation", "outlook"], visible: true},

        {title: "The Future of Cannabis Technology", content: "Technology is revolutionizing every aspect of the cannabis industry, from cultivation to consumption. Here are the innovations shaping the future.\n\n## Precision Agriculture\n\nAI-powered growing systems monitor temperature, humidity, light, and nutrient levels in real-time. Machine learning algorithms optimize growing conditions for maximum yield and potency, reducing waste by up to 30%.\n\n## Blockchain and Supply Chain\n\nBlockchain technology is being used to create transparent, tamper-proof records of every step in the cannabis supply chain — from seed to sale. This ensures:\n- Product authenticity\n- Regulatory compliance\n- Consumer safety\n- Quality traceability\n\n## Personalized Medicine\n\nGenetic testing and AI are enabling personalized cannabis recommendations based on individual genetics, medical history, and desired effects. Companies are developing apps that match patients with optimal strains and dosages.\n\n## Advanced Extraction\n\nNew extraction technologies like supercritical CO2 and ultrasonic extraction are producing cleaner, more potent concentrates with better terpene preservation.\n\n## Nano-Emulsion Technology\n\nNano-emulsification is making cannabis more bioavailable, meaning edibles and beverages can take effect in as little as 10-15 minutes instead of the traditional 60-90 minutes.\n\n## Delivery Innovation\n\n- Temperature-controlled packaging\n- GPS-tracked delivery vehicles\n- Age verification technology\n- Drone delivery pilots in select markets", summary: "How AI, blockchain, nano-technology, and precision agriculture are transforming cannabis.", category: "Industry", tags: ["technology", "innovation", "future", "ai"], visible: true},

        // Health & Wellness
        {title: "Cannabis and Mental Health: What the Research Says", content: "The relationship between cannabis and mental health is complex and nuanced. While cannabis can provide relief for certain mental health conditions, it's important to understand both the benefits and risks.\n\n## Anxiety\n\n### The Evidence\nLow to moderate doses of CBD have shown significant anxiolytic (anti-anxiety) effects in clinical trials. However, high doses of THC can actually increase anxiety in some individuals.\n\n### Best Approach\n- Start with CBD-dominant products\n- Use strains high in linalool and limonene terpenes\n- Microdose THC (1-2.5mg) if using THC products\n- Avoid high-THC strains if prone to anxiety\n\n## Depression\n\n### The Evidence\nCertain cannabis compounds may help boost serotonin levels in the short term. Sativa strains are often reported as mood-elevating by patients.\n\n### Caution\nRegular heavy use may worsen depression over time. Medical supervision is essential.\n\n## PTSD\n\n### The Evidence\nCannabis has shown promise in reducing PTSD symptoms, particularly nightmares and hyperarousal. Several clinical trials are underway specifically for PTSD treatment.\n\n## Insomnia\n\n### The Evidence\nTHC can reduce the time it takes to fall asleep and increase deep sleep phases. CBD may help with sleep anxiety. Indica strains are most commonly used.\n\n## Important Considerations\n\n- Always consult a mental health professional before using cannabis for mental health\n- Cannabis interacts with many psychiatric medications\n- Adolescents and young adults should be especially cautious\n- Quality and consistency of products matter significantly", summary: "An evidence-based look at how cannabis interacts with anxiety, depression, PTSD, and sleep disorders.", category: "Health", tags: ["mental-health", "anxiety", "depression", "research"], visible: true},

        {title: "Cannabis for Chronic Pain: A Patient's Guide", content: "Chronic pain is the number one reason patients seek medical marijuana. This guide covers everything you need to know about using cannabis to manage persistent pain.\n\n## Types of Pain Cannabis Can Help\n\n### Neuropathic Pain\nNerve damage pain (diabetic neuropathy, sciatica, post-surgical). Cannabis is particularly effective here, with multiple studies showing 30-50% pain reduction.\n\n### Inflammatory Pain\nArthritis, autoimmune conditions, sports injuries. CBD's anti-inflammatory properties combined with THC's pain-modulating effects provide dual-action relief.\n\n### Central Pain\nFibromyalgia, migraines, IBS. These conditions involve central sensitization, and cannabis may help 'reset' pain signaling.\n\n## Choosing Your Products\n\n### For Localized Pain\n**Topicals:** Apply directly to the affected area. CBD and THC creams, balms, and patches provide targeted relief without psychoactive effects.\n\n### For Widespread Pain\n**Tinctures or Edibles:** Provide systemic relief that lasts 4-8 hours. Best for conditions like fibromyalgia.\n\n### For Breakthrough Pain\n**Vaporization:** Fastest onset (1-3 minutes) for sudden pain spikes. Keep a vape pen for acute episodes.\n\n## Building Your Pain Management Protocol\n\n1. **Baseline:** Start with CBD tincture twice daily\n2. **Add THC:** Introduce low-dose THC at night for sleep\n3. **Adjust:** Gradually increase until pain is manageable\n4. **Layer:** Use topicals for flare-ups on top of oral baseline\n5. **Track:** Keep a pain diary to optimize your protocol", summary: "A comprehensive guide to using medical marijuana for managing different types of chronic pain.", category: "Health", tags: ["chronic-pain", "medical", "patient-guide", "pain-management"], visible: true},

        {title: "Cannabis and Exercise: An Unlikely Partnership", content: "Once dismissed as the domain of couch potatoes, cannabis is gaining serious traction in the fitness and wellness communities. Here's how athletes and fitness enthusiasts are incorporating cannabis into their routines.\n\n## Pre-Workout\n\nSome athletes use low-dose sativa strains or CBD products before workouts for:\n- Enhanced focus and mind-muscle connection\n- Reduced pre-workout anxiety\n- Increased enjoyment of repetitive exercises\n- Pain threshold elevation for pushing through tough sets\n\n## Post-Workout Recovery\n\nThis is where cannabis really shines in the fitness world:\n- **CBD topicals** for muscle soreness and joint inflammation\n- **CBD:THC tinctures** for systemic inflammation reduction\n- **Indica strains** for rest and recovery on off days\n- **CBD bath bombs** for full-body recovery\n\n## The Science\n\nCBD has been shown to reduce exercise-induced inflammation and oxidative stress. THC may help with pain perception during intense training. The anti-inflammatory properties of both cannabinoids support faster recovery.\n\n## What Athletes Say\n\nProfessional athletes in MMA, long-distance running, cycling, and strength sports have publicly endorsed cannabis for recovery. The World Anti-Doping Agency removed CBD from its prohibited list in 2018.\n\n## Guidelines\n\n- Never operate heavy equipment or do dangerous activities while impaired\n- CBD-only products are best for pre-workout use\n- Save THC for post-workout recovery\n- Stay hydrated — cannabis can cause dry mouth\n- Listen to your body and adjust accordingly", summary: "How fitness enthusiasts and athletes are using cannabis for focus, recovery, and pain management.", category: "Health", tags: ["fitness", "exercise", "recovery", "cbd"], visible: true},

        {title: "Cannabis for Senior Citizens: Benefits and Safety", content: "Medical marijuana use among seniors is the fastest-growing demographic in cannabis. Adults over 65 are discovering that cannabis can address many age-related conditions with fewer side effects than traditional pharmaceuticals.\n\n## Common Conditions\n\n### Arthritis\nCannabis topicals and tinctures can provide significant relief from joint pain and inflammation. Many seniors report reducing or eliminating their NSAID use.\n\n### Insomnia\nAge-related sleep disturbances respond well to indica strains and CBD tinctures taken before bed. Unlike sleep medications, cannabis has a much lower risk of dependence.\n\n### Appetite Loss\nTHC is a well-known appetite stimulant, helping seniors maintain healthy nutrition — critical for overall health and recovery from illness.\n\n### Chronic Pain\nFrom back pain to neuropathy, cannabis offers an alternative to opioids with far fewer risks of addiction and overdose.\n\n## Safety Considerations for Seniors\n\n- **Start with extremely low doses** — seniors are often more sensitive to THC\n- **Check drug interactions** — cannabis can interact with blood thinners, blood pressure medications, and other common prescriptions\n- **Avoid smoking** — use tinctures, edibles, or vaporizers instead\n- **Fall risk** — THC can affect balance; use while seated or lying down initially\n- **Consult your doctor** — always discuss with your healthcare provider\n\n## Getting Started\n\n1. Begin with CBD-only products for 1-2 weeks\n2. If needed, add low-dose THC (1-2.5mg)\n3. Use delivery methods with predictable dosing (tinctures, capsules)\n4. Keep a symptoms diary\n5. Regular check-ins with your healthcare provider", summary: "How seniors can safely use medical marijuana for arthritis, pain, sleep, and appetite issues.", category: "Health", tags: ["seniors", "elderly", "safety", "arthritis"], visible: true},

        // Tips & How-To
        {title: "How to Store Your Cannabis Properly", content: "Proper storage is the difference between enjoying premium cannabis and watching your investment degrade. Follow these guidelines to keep your products fresh, potent, and safe.\n\n## The Four Enemies of Cannabis\n\n### 1. Light\nUV rays break down cannabinoids and terpenes. Store cannabis in opaque or dark-colored containers, away from direct sunlight.\n\n### 2. Heat\nHigh temperatures cause terpenes to evaporate and can promote mold growth. Ideal storage temperature is 60-70°F (15-21°C).\n\n### 3. Humidity\nToo much moisture breeds mold; too little dries out trichomes. Ideal relative humidity is 59-63%. Use humidity packs (like Boveda) to maintain optimal levels.\n\n### 4. Air\nOxygen degrades cannabinoids over time. Use airtight containers and minimize the air space above your cannabis.\n\n## Best Storage Containers\n\n- **Glass mason jars** with airtight seals (best overall)\n- **UV-protected glass** (premium option)\n- **Vacuum-sealed bags** (for long-term storage)\n\n## What to Avoid\n\n- Plastic bags (static pulls trichomes off)\n- Refrigerators (humidity fluctuations)\n- Freezers (trichomes become brittle and break)\n- Near electronics (heat generation)\n\n## Shelf Life\n\n| Product | Proper Storage | Improper Storage |\n|---------|---------------|------------------|\n| Flower | 6-12 months | 2-3 months |\n| Edibles | Per packaging | Reduced by 50% |\n| Concentrates | 12+ months | 3-6 months |\n| Tinctures | 12-18 months | 6 months |", summary: "Essential tips for keeping your cannabis products fresh, potent, and mold-free.", category: "Tips", tags: ["storage", "tips", "quality", "freshness"], visible: true},

        {title: "How to Read Cannabis Lab Test Results", content: "Lab testing is one of the most important aspects of safe cannabis consumption. Understanding lab results empowers you to make informed decisions about what you put in your body.\n\n## Cannabinoid Profile\n\nThe most important section of any lab report:\n\n### THC Percentage\n- **Total THC** = THCa × 0.877 + delta-9 THC\n- This tells you the maximum psychoactive potential\n- Flower typically ranges from 15-30%\n\n### CBD Percentage\n- Important for medical patients seeking non-psychoactive relief\n- Look for the CBD:THC ratio\n\n### Minor Cannabinoids\n- **CBN:** Mildly sedating, increases with age\n- **CBG:** Anti-inflammatory, non-psychoactive\n- **THCV:** Appetite suppressant, energizing\n\n## Terpene Profile\n\nNot all labs test for terpenes, but those that do provide valuable information about expected effects and flavor.\n\n## Contaminant Testing\n\nThis is the safety section:\n\n### Pesticides\nLab should test for a panel of common pesticides. Results should show 'ND' (Not Detected) or below action limits.\n\n### Heavy Metals\nLead, arsenic, cadmium, and mercury levels should all be well below safety thresholds.\n\n### Microbial\nTests for mold, mildew, E. coli, and salmonella. Essential for immunocompromised patients.\n\n### Residual Solvents\nFor concentrates and extracts — ensures harmful chemicals from the extraction process are not present.\n\n## Red Flags\n\n- No lab results available at all\n- Results from an unaccredited laboratory\n- THC levels over 35% for flower (likely inaccurate)\n- Any contaminant above action limits", summary: "Learn how to interpret cannabinoid profiles, terpene tests, and contaminant screenings on lab reports.", category: "Tips", tags: ["lab-testing", "safety", "quality", "education"], visible: true},

        {title: "First Time Using Cannabis Edibles? Read This First", content: "Edibles are one of the most popular cannabis products, but they are also the most commonly misused. This guide will help you have a safe, enjoyable first edible experience.\n\n## How Edibles Work\n\nUnlike smoking, which delivers cannabinoids directly to your bloodstream through the lungs, edibles must pass through your digestive system first. THC is processed by your liver, converting it to 11-hydroxy-THC — a metabolite that is 2-3 times more potent than regular THC.\n\n## The Golden Rules\n\n### 1. Start with 2.5-5mg THC\nThis is a microdose that most people tolerate well. You can always take more, but you cannot take less.\n\n### 2. Wait at Least 2 Hours\nEdibles can take 30 minutes to 2 hours to kick in. Eating on a full stomach delays onset further. DO NOT take a second dose before 2 hours.\n\n### 3. Have CBD on Hand\nCBD can counteract THC's psychoactive effects. If you take too much THC, CBD tincture under the tongue can help calm you down.\n\n### 4. Choose a Safe Setting\nBe at home or somewhere comfortable. Have water, snacks, and entertainment ready. Don't plan to drive or operate machinery.\n\n## What to Expect\n\n- **30-60 min:** Subtle warmth, slight mood shift\n- **1-2 hours:** Peak effects — euphoria, relaxation, altered perception\n- **3-4 hours:** Plateau — steady state of effects\n- **4-8 hours:** Gradual comedown\n\n## If You Take Too Much\n\nDon't panic. No one has ever died from a cannabis overdose. You will be fine.\n- Drink water\n- Take CBD if available\n- Chew black peppercorns (contains caryophyllene, which reduces anxiety)\n- Lie down in a comfortable place\n- Call a trusted friend\n- Symptoms will pass within a few hours", summary: "Everything first-time edible users need to know for a safe and enjoyable experience.", category: "Tips", tags: ["edibles", "beginner", "safety", "dosing"], visible: true},

        // Lifestyle
        {title: "Cooking with Cannabis: A Beginner's Kitchen Guide", content: "Cannabis-infused cooking is an art that combines culinary creativity with precise dosing. Here's how to make your own edibles at home.\n\n## Step 1: Decarboxylation\n\nRaw cannabis contains THCa, which is not psychoactive. You must heat it to convert THCa to THC:\n1. Preheat oven to 245°F (118°C)\n2. Break cannabis into small pieces on a baking sheet\n3. Bake for 30-40 minutes, stirring halfway\n4. Cannabis should look lightly toasted\n\n## Step 2: Make Cannabutter\n\n**Ingredients:**\n- 1 cup butter\n- 1 cup decarboxylated cannabis (7-10g)\n- 1 cup water\n\n**Method:**\n1. Melt butter with water in a saucepan on low heat\n2. Add decarboxylated cannabis\n3. Simmer on very low heat for 2-3 hours, stirring occasionally\n4. Strain through cheesecloth into a container\n5. Refrigerate until butter solidifies; discard water\n\n## Step 3: Calculate Your Dose\n\nIf you use 10g of cannabis at 20% THC:\n- Total THC = 10g × 0.20 = 2,000mg\n- Divided into 1 cup of butter\n- 1 tablespoon of butter ≈ 125mg THC\n- Use 1/10 tablespoon per serving for a 12.5mg dose\n\n## Easy Recipes to Start\n\n### Cannabis Brownies\nReplace regular butter with cannabutter in any brownie recipe. Cut into precise portions.\n\n### Infused Honey\nWarm honey with decarbed cannabis on low heat for 2 hours. Strain. Add to tea, toast, or yogurt.\n\n### Cannabis Olive Oil\nSame process as cannabutter but using olive oil. Perfect for savory dishes, pasta, and salad dressings.\n\n## Safety Tips\n- Always label infused products clearly\n- Store away from children and pets\n- Start with small servings\n- Wait 2 hours before consuming more", summary: "Learn decarboxylation, cannabutter basics, and easy recipes for making edibles at home.", category: "Lifestyle", tags: ["cooking", "edibles", "recipes", "cannabutter"], visible: true},

        {title: "Cannabis Tourism: Top Destinations for 2026", content: "As cannabis legalization spreads across the globe, a new form of tourism is emerging. From Amsterdam's legendary coffeeshops to Africa's emerging markets, here are the top cannabis-friendly destinations for 2026.\n\n## Amsterdam, Netherlands\nThe OG of cannabis tourism. Amsterdam's coffeeshops have been serving cannabis since the 1970s. Must-visit: Barney's Coffeeshop, The Bulldog, and Grey Area.\n\n## Colorado, USA\nThe first US state to legalize recreational cannabis. Visit dispensaries in Denver, cannabis-friendly tours, and 420-themed hotels.\n\n## Thailand\nAsia's first country to decriminalize cannabis. Bangkok's cannabis cafes and wellness retreats are attracting visitors from across the region.\n\n## Jamaica\nThe spiritual home of ganja culture. Visit herb houses, Rastafari communities, and cannabis farms. The Ganja Amendments Act allows small-scale cultivation.\n\n## South Africa\nFollowing the Constitutional Court ruling allowing private use, South Africa's cannabis scene is booming. The Cannabis Expo in Johannesburg is a must-attend event.\n\n## Ghana\nGhana's emerging medical cannabis market is creating opportunities for cannabis wellness tourism. Combine with the country's rich cultural heritage, beautiful coastline, and vibrant food scene.\n\n## Uruguay\nThe first country in the world to fully legalize cannabis. A pioneer in regulation and an increasingly popular destination for cannabis enthusiasts.\n\n## Travel Tips\n- Always research local laws before traveling\n- Never transport cannabis across international borders\n- Respect local customs and consume responsibly\n- Purchase from licensed dispensaries only", summary: "The world's best cannabis-friendly travel destinations for the adventurous enthusiast.", category: "Lifestyle", tags: ["tourism", "travel", "destinations", "culture"], visible: true},

        {title: "Cannabis and Creativity: How Artists Use the Plant", content: "From jazz musicians in 1920s New Orleans to modern-day painters and writers, cannabis has long been associated with creative expression. But does it actually enhance creativity?\n\n## The Science of Cannabis and Creativity\n\nCannabis increases cerebral blood flow to the frontal lobe — the area of the brain responsible for creative thinking. THC specifically promotes divergent thinking, the cognitive process of generating multiple solutions to a problem.\n\n## How Artists Use Cannabis\n\n### Musicians\nMany musicians report that cannabis helps them:\n- Hear music in new ways\n- Break through creative blocks\n- Enhance emotional expression\n- Experiment with new sounds and rhythms\n\n### Visual Artists\nPainters, sculptors, and digital artists use cannabis to:\n- Enter a flow state more easily\n- See colors and patterns more vividly\n- Think outside conventional frameworks\n- Reduce performance anxiety\n\n### Writers\nAuthors and poets often use cannabis to:\n- Access stream-of-consciousness writing\n- Make unexpected connections between ideas\n- Overcome writer's block\n- Edit with fresh perspective\n\n## Tips for Creative Cannabis Use\n\n1. **Use sativa or sativa-dominant hybrids** for cerebral stimulation\n2. **Microdose** (1-3mg THC) to enhance without impairing\n3. **Set an intention** before consuming — what do you want to create?\n4. **Have materials ready** — canvas, instrument, notebook\n5. **Record everything** — great ideas can be fleeting\n6. **Review sober** — not everything created while high is a masterpiece", summary: "Exploring the relationship between cannabis and artistic expression across music, art, and writing.", category: "Lifestyle", tags: ["creativity", "art", "music", "culture"], visible: true},

        // Product Guides
        {title: "Complete Guide to Cannabis Concentrates", content: "Concentrates are the fastest-growing segment of the cannabis market. With THC levels reaching 80-90%, these products offer powerful, efficient dosing for experienced patients.\n\n## Types of Concentrates\n\n### Shatter\n- **Appearance:** Translucent, glass-like\n- **Texture:** Hard, brittle\n- **THC:** 70-90%\n- **Best for:** Dabbing\n\n### Wax/Budder\n- **Appearance:** Opaque, golden\n- **Texture:** Soft, malleable\n- **THC:** 70-85%\n- **Best for:** Dabbing, adding to joints\n\n### Live Resin\n- **Appearance:** Golden, saucy\n- **Texture:** Wet, terpy\n- **THC:** 65-85%\n- **Best for:** Flavor chasers (preserves terpenes)\n\n### Rosin\n- **Appearance:** Golden to amber\n- **Texture:** Varies\n- **THC:** 60-80%\n- **Best for:** Solventless enthusiasts\n\n### Distillate\n- **Appearance:** Clear to amber\n- **Texture:** Thick oil\n- **THC:** 85-99%\n- **Best for:** Vape cartridges, edibles\n\n### Hash/Kief\n- **Appearance:** Sandy to dark brown\n- **Texture:** Powdery to pressed\n- **THC:** 20-60%\n- **Best for:** Traditional use, adding to bowls\n\n## Consumption Methods\n\n- **Dabbing:** Most common. Requires a dab rig or e-nail\n- **Vaporizing:** Portable vape pens and cartridges\n- **Topping:** Sprinkle on flower in a bowl or joint\n- **Edibles:** Distillate can be eaten directly or added to food\n\n## Safety Warning\n\nConcentrates are extremely potent. If you are new to cannabis, start with flower or low-dose edibles first. A single dab can contain as much THC as an entire joint.", summary: "Everything you need to know about shatter, wax, live resin, rosin, and other cannabis concentrates.", category: "Products", tags: ["concentrates", "dabbing", "shatter", "wax"], visible: true},

        {title: "Topicals and Transdermals: Cannabis Without the High", content: "Cannabis topicals represent one of the most accessible entry points into medical marijuana. Applied directly to the skin, they provide localized relief without psychoactive effects.\n\n## How Topicals Work\n\nCannabinoids in topicals interact with CB1 and CB2 receptors in the skin, muscles, and nerves. They do NOT enter the bloodstream in significant amounts, which means:\n- No psychoactive effects\n- No positive drug test (with most products)\n- Targeted, localized relief\n\n## Types of Topicals\n\n### Creams and Lotions\nMoisturizing formulas with cannabis extract. Good for large areas and daily use.\n\n### Balms and Salves\nThicker, wax-based formulas with higher cannabinoid concentration. Best for targeted pain points.\n\n### Patches\nTransdermal patches DO deliver cannabinoids into the bloodstream, providing systemic effects. Offers steady, long-lasting dosing (8-12 hours).\n\n### Bath Products\nCBD bath bombs and soaks provide full-body relaxation and muscle relief.\n\n### Roll-Ons\nConvenient application for specific areas like temples (headaches) or joints.\n\n## Best Uses\n\n- **Arthritis:** CBD:THC cream applied to joints 2-3 times daily\n- **Muscle soreness:** Menthol-infused balm post-workout\n- **Headaches:** CBD roll-on applied to temples and neck\n- **Skin conditions:** CBD lotion for eczema, psoriasis\n- **Period cramps:** THC-infused heat patches on lower abdomen\n\n## What to Look For\n\n- Full-spectrum over isolate (entourage effect)\n- At least 200mg CBD per oz for effectiveness\n- Added ingredients like menthol, arnica, or camphor for enhanced relief\n- Third-party lab tested", summary: "How cannabis creams, balms, patches, and bath products provide relief without getting you high.", category: "Products", tags: ["topicals", "cbd", "pain-relief", "transdermal"], visible: true},

        {title: "Vaping Cannabis: Pros, Cons, and Safety Tips", content: "Vaporizing has become one of the most popular ways to consume cannabis. But with the proliferation of vape products, it is important to understand what you are inhaling.\n\n## How Vaping Works\n\nVaporizers heat cannabis flower or concentrates to a temperature that releases cannabinoids and terpenes as vapor without combustion. This means fewer harmful byproducts compared to smoking.\n\n## Types of Vaporizers\n\n### Dry Herb Vaporizers\n- Use actual cannabis flower\n- Better flavor profile\n- Temperature control for different effects\n- More expensive upfront, cheaper long-term\n\n### Oil Cartridges\n- Pre-filled with cannabis oil\n- Most convenient and discreet\n- Consistent dosing\n- Check for lab testing and avoid black market carts\n\n### Disposable Vape Pens\n- All-in-one, no maintenance\n- Good for trying new strains\n- Higher cost per mg\n\n## Optimal Temperatures\n\n| Temp | What Releases | Effects |\n|------|--------------|--------|\n| 325-350°F | THC, CBD, terpenes | Mild, flavorful |\n| 350-400°F | Most cannabinoids | Balanced effects |\n| 400-430°F | Everything | Maximum extraction |\n\n## Safety Concerns\n\n### What to Avoid\n- Products with Vitamin E acetate\n- Unregulated or black market cartridges\n- Products without lab test results\n- Extremely cheap carts (quality costs money)\n\n### What to Look For\n- Licensed, regulated products\n- Full panel lab results\n- Ceramic or glass cartridge hardware\n- Reputable brands with transparent sourcing", summary: "A balanced look at cannabis vaping — types, temperatures, and how to stay safe.", category: "Products", tags: ["vaping", "safety", "products", "guide"], visible: true},

        // Recipes & Food
        {title: "5 Cannabis-Infused Smoothie Recipes for Wellness", content: "Start your morning with a wellness boost. These cannabis-infused smoothie recipes combine nutrition with the therapeutic benefits of CBD and THC.\n\n## Important Notes\n- Use cannabis tincture for precise dosing\n- Start with 5-10mg CBD or 2.5mg THC per smoothie\n- Fats improve cannabinoid absorption (add coconut oil or nut butter)\n\n## 1. Green Recovery Smoothie\n- 1 cup spinach\n- 1 banana\n- 1/2 avocado\n- 1 tbsp hemp seeds\n- 1 cup almond milk\n- 5-10mg CBD tincture\n- Ice\nBlend and enjoy. The healthy fats from avocado enhance CBD absorption.\n\n## 2. Tropical Pain Relief\n- 1 cup mango chunks\n- 1/2 cup pineapple\n- 1 tbsp coconut oil\n- 1/2 cup coconut milk\n- 5mg THC tincture\n- Turmeric pinch\nMango contains myrcene, which may enhance THC effects.\n\n## 3. Berry Antioxidant Blast\n- 1 cup mixed berries\n- 1 tbsp almond butter\n- 1/2 cup Greek yogurt\n- 1 cup oat milk\n- 10mg CBD tincture\n- 1 tbsp honey\n\n## 4. Chocolate Recovery Shake\n- 1 banana\n- 2 tbsp cacao powder\n- 1 tbsp peanut butter\n- 1 cup milk of choice\n- 5mg CBD + 2.5mg THC tincture\n- 1 scoop protein powder\nPerfect post-workout recovery with anti-inflammatory cannabinoids.\n\n## 5. Golden Milk Smoothie\n- 1 cup warm milk\n- 1/2 tsp turmeric\n- 1/4 tsp cinnamon\n- 1 tbsp honey\n- 1 tbsp coconut oil\n- 10mg CBD tincture\n- Pinch of black pepper\nA soothing evening smoothie for relaxation and sleep.", summary: "Five delicious cannabis-infused smoothie recipes for morning wellness and post-workout recovery.", category: "Recipes", tags: ["recipes", "smoothies", "wellness", "cbd"], visible: true},
    ];
    const blogImages = [
        "photo-1589998059171-988d887df646", "photo-1603909223429-69bb7101f420", "photo-1585063560739-48b88dab5444",
        "photo-1587049352851-8d4e89133924", "photo-1556228578-0d85b1a4d571", "photo-1584308666744-24d5c474f2ae",
        "photo-1505751172876-fa1923c5c528", "photo-1532187863486-abf9dbad1b69", "photo-1559757148-5c350d0d3c56",
        "photo-1571019613454-1cb2f99b2d8b", "photo-1544367567-0f2fcb009e0b", "photo-1518611012118-696072aa579a",
        "photo-1576091160550-2173dba999ef", "photo-1607619056574-7b8d3ee536b2", "photo-1606567595334-d39972c85dbe",
        "photo-1581091226825-a6a2a5aee158", "photo-1542601906990-b4d3fb778b09", "photo-1581093458791-9d42cc29f4d4",
        "photo-1498837167922-ddd27525d352", "photo-1512621776951-a57141f2eefd", "photo-1621939514649-280e2ee25f60",
        "photo-1515023115894-bacee0cfc86a", "photo-1506126613408-eca07ce68773"
    ];
    const blogs = await Blog.insertMany(blogsData.map((b, i) => ({
        ...b, author: rand(admins)._id,
        slug: b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: `https://images.unsplash.com/${blogImages[i % blogImages.length]}?w=800&h=400&fit=crop&q=80`,
        createdAt: daysAgo(randInt(1, 120))
    })));
    console.log(`Created ${blogs.length} blogs`);

    // ─── COUPONS ─────────────────────────────────────────
    const flowerProducts = products.filter(p => p.variant === 'flower').slice(0, 5);
    const edibleProducts = products.filter(p => p.variant === 'edible').slice(0, 3);
    const accessoryProducts = products.filter(p => p.variant === 'accessory').slice(0, 2);

    const couponsData = [
        // 1. Welcome coupon — new users only, first order, no restrictions
        {
            code: "WELCOME20", description: "20% off your first order as a new Ruderalis member",
            discount: {type: "percentage", value: 20}, maxDiscount: 50,
            maxUses: 0, maxUsesPerUser: 1,
            minOrderAmount: 0, firstOrderOnly: true, newUsersOnly: true,
            startDate: daysAgo(90), endDate: daysAgo(-365), active: true
        },
        // 2. Seasonal — percentage with cap, min order
        {
            code: "SPRING15", description: "Spring 2026 — 15% off orders over GHS 50 (max GHS 30 discount)",
            discount: {type: "percentage", value: 15}, maxDiscount: 30,
            maxUses: 500, maxUsesPerUser: 2,
            minOrderAmount: 50, minItems: 1,
            startDate: daysAgo(10), endDate: daysAgo(-60), active: true
        },
        // 3. Fixed amount — any order over GHS 30, unlimited uses per user
        {
            code: "SAVE10", description: "GHS 10 off any order over GHS 30",
            discount: {type: "fixed", value: 10},
            maxUses: 0, maxUsesPerUser: 0,
            minOrderAmount: 30,
            startDate: daysAgo(60), endDate: daysAgo(-120), active: true
        },
        // 4. Free shipping — requires min order amount
        {
            code: "FREESHIP", description: "Free shipping on orders over GHS 80",
            discount: {type: "fixed", value: 0}, freeShipping: true,
            maxUses: 1000, maxUsesPerUser: 3,
            minOrderAmount: 80,
            startDate: daysAgo(5), endDate: daysAgo(-90), active: true
        },
        // 5. VIP — only specific loyal customers, big discount
        {
            code: "VIP25", description: "Exclusive 25% off for VIP customers",
            discount: {type: "percentage", value: 25}, maxDiscount: 100,
            maxUses: 100, maxUsesPerUser: 1,
            minOrderAmount: 200,
            applicableUsers: [clients[0]._id, clients[1]._id, clients[2]._id, clients[3]._id, clients[4]._id],
            startDate: daysAgo(1), endDate: daysAgo(-90), active: true
        },
        // 6. Flower only — applies only to flower variant products
        {
            code: "FLOWER30", description: "30% off all flower products (max GHS 40)",
            discount: {type: "percentage", value: 30}, maxDiscount: 40,
            maxUses: 300, maxUsesPerUser: 2,
            applicableVariants: ["flower"],
            minOrderAmount: 30,
            startDate: daysAgo(7), endDate: daysAgo(-45), active: true
        },
        // 7. Edibles promo — specific products only
        {
            code: "EDIBLES20", description: "20% off select edible products",
            discount: {type: "percentage", value: 20}, maxDiscount: 25,
            maxUses: 200, maxUsesPerUser: 1,
            applicableVariants: ["edible"],
            applicableProducts: edibleProducts.map(p => p._id),
            startDate: daysAgo(3), endDate: daysAgo(-30), active: true
        },
        // 8. Shop-specific — only valid at first 2 shops
        {
            code: "SHOPSPECIAL", description: "GHS 15 off at Green Leaf Dispensary & Herbal Wellness Center",
            discount: {type: "fixed", value: 15},
            maxUses: 150, maxUsesPerUser: 1,
            minOrderAmount: 40,
            applicableShops: [shops[0]._id, shops[1]._id],
            startDate: daysAgo(14), endDate: daysAgo(-60), active: true
        },
        // 9. Bulk order — min 3 items, percentage discount
        {
            code: "BULK15", description: "15% off when you buy 3 or more items",
            discount: {type: "percentage", value: 15}, maxDiscount: 60,
            maxUses: 0, maxUsesPerUser: 5,
            minItems: 3, minOrderAmount: 60,
            startDate: daysAgo(20), endDate: daysAgo(-90), active: true
        },
        // 10. Weekend flash — short window, high discount, limited uses
        {
            code: "FLASH40", description: "Flash sale — 40% off this weekend only! Limited to 50 uses.",
            discount: {type: "percentage", value: 40}, maxDiscount: 80,
            maxUses: 50, maxUsesPerUser: 1,
            minOrderAmount: 100,
            startDate: daysAgo(2), endDate: daysAgo(-3), active: true
        },
        // 11. Accessories only — excludes flower and edible
        {
            code: "GEAR25", description: "25% off all accessories and gear",
            discount: {type: "percentage", value: 25}, maxDiscount: 30,
            maxUses: 0, maxUsesPerUser: 2,
            applicableVariants: ["accessory"],
            startDate: daysAgo(10), endDate: daysAgo(-60), active: true
        },
        // 12. Excludes specific products — blacklist style
        {
            code: "ALMOST10", description: "GHS 10 off (excludes premium flower products)",
            discount: {type: "fixed", value: 10},
            maxUses: 0, maxUsesPerUser: 3,
            minOrderAmount: 25,
            excludedProducts: flowerProducts.slice(0, 3).map(p => p._id),
            startDate: daysAgo(15), endDate: daysAgo(-75), active: true
        },
        // 13. Vendor-only coupon — only vendor accounts
        {
            code: "VENDOR10", description: "10% off for vendors restocking supplies",
            discount: {type: "percentage", value: 10}, maxDiscount: 50,
            maxUses: 100, maxUsesPerUser: 2,
            applicableRoles: ["vendor"],
            minOrderAmount: 100,
            startDate: daysAgo(5), endDate: daysAgo(-60), active: true
        },
        // 14. High-value order coupon — min GHS 500
        {
            code: "BIG50", description: "GHS 50 off orders over GHS 500",
            discount: {type: "fixed", value: 50},
            maxUses: 0, maxUsesPerUser: 1,
            minOrderAmount: 500,
            startDate: daysAgo(30), endDate: daysAgo(-120), active: true
        },
        // 15. Combinable coupon — can stack with others
        {
            code: "EXTRA5", description: "Extra GHS 5 off — can be combined with other coupons",
            discount: {type: "fixed", value: 5},
            maxUses: 0, maxUsesPerUser: 0,
            canCombine: true,
            startDate: daysAgo(30), endDate: daysAgo(-180), active: true
        },
        // 16. Expired coupon — for testing
        {
            code: "EXPIRED50", description: "This coupon has expired",
            discount: {type: "percentage", value: 50},
            maxUses: 100, maxUsesPerUser: 1,
            startDate: daysAgo(90), endDate: daysAgo(5), active: true
        },
        // 17. Maxed out coupon — for testing
        {
            code: "SOLDOUT", description: "This coupon has reached its usage limit",
            discount: {type: "fixed", value: 20},
            maxUses: 3, usedCount: 3, maxUsesPerUser: 1,
            startDate: daysAgo(30), endDate: daysAgo(-60), active: true
        },
        // 18. Inactive coupon — for testing
        {
            code: "DISABLED", description: "This coupon has been deactivated by admin",
            discount: {type: "percentage", value: 25},
            maxUses: 0, maxUsesPerUser: 1,
            startDate: daysAgo(10), endDate: daysAgo(-30), active: false
        },
    ];
    const coupons = await Coupon.insertMany(couponsData.map(c => ({...c, createdBy: admins[0]._id})));
    console.log(`Created ${coupons.length} coupons`);

    // ─── NEWSLETTER ──────────────────────────────────────
    const newsletterEmails = [...clients.map(c => c.email), "fan1@email.com", "fan2@email.com", "fan3@email.com", "subscriber1@gmail.com", "subscriber2@gmail.com"];
    const newsletters = await Newsletter.insertMany(newsletterEmails.map(email => ({email, active: true})));
    console.log(`Created ${newsletters.length} newsletter subscriptions`);

    // ─── WISHLISTS ───────────────────────────────────────
    const wishlistsData = [];
    for (const client of clients.slice(0, 12)) {
        const numWishes = randInt(2, 5);
        const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, numWishes);
        for (const prod of shuffled) {
            wishlistsData.push({user: client._id, product: prod._id});
        }
    }
    const wishlists = await Wishlist.insertMany(wishlistsData);
    console.log(`Created ${wishlists.length} wishlist items`);

    // ─── ADDRESSES ───────────────────────────────────────
    const addressesData = [];
    const streetNames = ["Oxford St", "Independence Ave", "Kojo Thompson Rd", "Ring Rd", "Liberation Rd", "Castle Rd", "Airport Bypass", "Spintex Rd", "Achimota Rd", "Osu Badu St", "Cantonments Rd", "Labadi Rd", "Tetteh Quarshie Ave", "Graphic Rd", "Barnes Rd"];
    const cities = ["Accra", "Tema", "Kumasi", "Takoradi", "Cape Coast", "Tamale", "Ho", "Sunyani", "Koforidua", "Obuasi"];
    const regions = ["Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Northern", "Volta", "Bono"];
    const landmarks = ["Near the big roundabout", "Opposite Total filling station", "Behind the market", "Next to MTN office", "Near the church", "Close to the school", "Behind the police station", "Near the hospital"];
    const labels = ["Home", "Work", "Office", "Parents House", "Partner Address", "Vacation Home", "Warehouse"];

    for (const client of clients) {
        // Everyone gets a Home address (default)
        addressesData.push({
            user: client._id, label: "Home", isDefault: true,
            street: client.address.street, city: client.address.city,
            region: client.address.region, country: "Ghana",
            gpAddressOrHouseNumber: client.address.gpAddressOrHouseNumber,
            landmark: rand(landmarks)
        });

        // First 10 clients get 3-4 addresses (for checkout testing)
        const extraCount = clients.indexOf(client) < 10 ? randInt(2, 3) : (Math.random() < 0.5 ? 1 : 0);
        for (let a = 0; a < extraCount; a++) {
            addressesData.push({
                user: client._id,
                label: labels[a + 1] || `Address ${a + 2}`,
                isDefault: false,
                street: `${randInt(1, 500)} ${rand(streetNames)}`,
                city: rand(cities),
                region: rand(regions),
                country: "Ghana",
                gpAddressOrHouseNumber: `GA-${randInt(100, 999)}-${randInt(1000, 9999)}`,
                landmark: rand(landmarks)
            });
        }
    }
    const addresses = await Address.insertMany(addressesData);
    console.log(`Created ${addresses.length} addresses`);

    // ─── PAYMENT METHODS ─────────────────────────────────
    const pmData = [];
    for (const client of clients) {
        pmData.push({
            user: client._id, type: "mobile_money",
            provider: rand(["mtn", "vodafone", "airtelTigo"]),
            number: `0${rand(["24", "54", "55"])}${randInt(1000000, 9999999)}`,
            name: client.fullName, isDefault: true
        });
    }
    const paymentMethods = await PaymentMethod.insertMany(pmData);
    console.log(`Created ${paymentMethods.length} payment methods`);

    // ─── SHOP VISITS ─────────────────────────────────────
    const visitsData = [];
    for (let i = 0; i < 300; i++) {
        visitsData.push({
            visitor: rand(clients)._id, shop: rand(shops)._id,
            createdAt: daysAgo(randInt(0, 60))
        });
    }
    const visits = await ShopVisit.insertMany(visitsData);
    console.log(`Created ${visits.length} shop visits`);

    // ─── PROMOTIONS ──────────────────────────────────────
    const promosData = [];
    for (let i = 0; i < 15; i++) {
        const isShop = Math.random() < 0.4;
        const vendor = rand(vendors);
        const payment = rand(payments);
        promosData.push({
            item: isShop ? {shop: rand(shops)._id} : {product: rand(products)._id},
            user: vendor._id,
            variant: isShop ? "shop" : "product",
            rank: randInt(1, 10),
            price: {amount: randInt(50, 300), currency: "GHS"},
            startDate: daysAgo(randInt(0, 30)),
            endDate: daysAgo(-randInt(30, 90)),
            duration: {amount: randInt(7, 30), unit: "day"},
            status: rand(["pending", "active", "active", "expired"]),
            payment: payment._id,
            createdAt: daysAgo(randInt(0, 45))
        });
    }
    const promotions = await Promotion.insertMany(promosData);
    console.log(`Created ${promotions.length} promotions`);

    // ─── BATCHES ─────────────────────────────────────────
    const suppliers = ["Green Valley Farms", "Mountain Top", "Sun Grown Co", "Sweet Leaf Edibles", "Extract Labs", "Heal Naturals", "Roll Masters", "Cloud Nine", "Pure Extract Co", "Craft Glass Co"];
    const batchesData = [];
    for (let i = 0; i < 20; i++) {
        const prod = rand(products);
        const qty = randInt(100, 1000);
        const rem = randInt(0, qty);
        const status = rem === 0 ? 'depleted' : rem < 20 ? 'low_stock' : 'active';
        batchesData.push({
            batchId: `B-2026-${String(i + 1).padStart(3, '0')}`,
            product: prod._id, supplier: rand(suppliers),
            quantity: qty, remaining: rem,
            receivedDate: daysAgo(randInt(10, 90)),
            expiryDate: daysAgo(-randInt(90, 365)),
            labTested: Math.random() < 0.85,
            testDate: daysAgo(randInt(12, 95)),
            thc: prod.thc || randFloat(15, 28), cbd: prod.cbd || randFloat(0, 5),
            status
        });
    }
    const batches = await Batch.insertMany(batchesData);
    console.log(`Created ${batches.length} batches`);

    // ─── LICENSES ────────────────────────────────────────
    const licensesData = [
        {type: "Medical Marijuana Center", number: "MMC-GH-2024-4201", issuedDate: daysAgo(730), expiryDate: daysAgo(-365), status: "active", dispensary: "All", authority: "Ghana FDA"},
        {type: "Retail Marijuana Store", number: "RMS-GH-2024-4202", issuedDate: daysAgo(600), expiryDate: daysAgo(-300), status: "active", dispensary: "Ruderalis Main St", authority: "Ghana FDA"},
        {type: "Marijuana Transporter", number: "MT-GH-2025-5501", issuedDate: daysAgo(365), expiryDate: daysAgo(-180), status: "active", dispensary: "All", authority: "Ghana NCA"},
        {type: "Controlled Substances Registration", number: "CSR-GH-2024-8901", issuedDate: daysAgo(500), expiryDate: daysAgo(-20), status: "expiring", dispensary: "All", authority: "Ghana NCA"},
        {type: "Marijuana Cultivation Facility", number: "MCF-GH-2025-3301", issuedDate: daysAgo(400), expiryDate: daysAgo(-500), status: "active", dispensary: "Grow Facility", authority: "Ghana FDA"},
        {type: "Business Operating Permit", number: "BOP-GH-2024-1001", issuedDate: daysAgo(800), expiryDate: daysAgo(-100), status: "active", dispensary: "All", authority: "Ghana Revenue Authority"},
    ];
    const licenses = await License.insertMany(licensesData);
    console.log(`Created ${licenses.length} licenses`);

    // ─── DISPENSARIES ────────────────────────────────────
    const dispensariesData = [
        {name: "Ruderalis Main St", address: "1420 Oxford Street, Osu, Accra", phone: "+233541001420", manager: "Marcus Thompson", staffCount: 8, status: "active", licenseNo: "DIS-GH-2024-001", licenseExpiry: daysAgo(-365), hours: "Mon-Sat 9AM-9PM, Sun 10AM-6PM", monthlyRevenue: 125000, totalOrders: 450, totalProducts: 45},
        {name: "Ruderalis Downtown", address: "710 Independence Ave, Accra Central", phone: "+233541000710", manager: "Jessica Rodriguez", staffCount: 6, status: "active", licenseNo: "DIS-GH-2024-002", licenseExpiry: daysAgo(-300), hours: "Mon-Sat 10AM-8PM, Sun 11AM-5PM", monthlyRevenue: 98000, totalOrders: 320, totalProducts: 38},
        {name: "Ruderalis Kumasi", address: "3200 Prempeh II St, Adum, Kumasi", phone: "+233541003200", manager: "Kwame Asante", staffCount: 5, status: "active", licenseNo: "DIS-GH-2025-003", licenseExpiry: daysAgo(-500), hours: "Mon-Sat 9AM-8PM, Sun 10AM-6PM", monthlyRevenue: 72000, totalOrders: 210, totalProducts: 28},
    ];
    const dispensaries = await Dispensary.insertMany(dispensariesData);
    console.log(`Created ${dispensaries.length} dispensaries`);

    // ─── AUDIT LOGS ──────────────────────────────────────
    const auditActions = [
        {action: "Product Created", category: "Products", details: "Added new product: Jack Herer (FL-JH-006)"},
        {action: "Order Processed", category: "Orders", details: "Order #RUD-2026-047 marked as delivering"},
        {action: "User Suspended", category: "Customers", details: "User robert.wilson@email.com suspended for policy violation"},
        {action: "Inventory Updated", category: "Inventory", details: "Batch B-2026-003 stock updated: 200 -> 5 units"},
        {action: "Coupon Created", category: "Promotions", details: "New promo code: SPRING15 - 15% off orders over GHS 50"},
        {action: "Staff Added", category: "Staff", details: "New staff member: Carlos Mendez (Security)"},
        {action: "Compliance Check", category: "Compliance", details: "Monthly compliance audit completed - all clear"},
        {action: "Batch Lab Results", category: "Inventory", details: "Lab results uploaded for batch B-2026-005"},
        {action: "Refund Issued", category: "Orders", details: "Order #RUD-2026-005 refunded: GHS 144.10 to Robert Wilson"},
        {action: "Admin Login", category: "System", details: "Admin login from IP 192.168.1.100"},
        {action: "License Updated", category: "Compliance", details: "CSR-GH-2024-8901 flagged as expiring soon"},
        {action: "Promotion Created", category: "Promotions", details: "New promo: FLASH40 - 40% off flash sale"},
        {action: "Shop Approved", category: "Products", details: "Shop 'Green Leaf Dispensary' approved and set to active"},
        {action: "Product Featured", category: "Products", details: "Purple Haze set as featured product until April 15"},
        {action: "Settings Updated", category: "Settings", details: "Tax rate updated from 12% to 15%"},
        {action: "Batch Received", category: "Inventory", details: "New batch B-2026-015: 500 units of Blue Dream from Green Valley Farms"},
        {action: "Password Changed", category: "Auth", details: "Admin sarah@ruderalis.com changed password"},
        {action: "Vendor Approved", category: "Customers", details: "Vendor application approved for kwame@greenleaf.com"},
        {action: "Order Cancelled", category: "Orders", details: "Order #RUD-2026-012 cancelled by customer request"},
        {action: "Dispensary Created", category: "Staff", details: "New location added: Ruderalis Kumasi"},
        {action: "Review Moderated", category: "Products", details: "Review on OG Kush hidden - inappropriate content"},
        {action: "Newsletter Sent", category: "Promotions", details: "Weekly newsletter sent to 25 subscribers"},
        {action: "Backup Completed", category: "System", details: "Database backup completed successfully"},
        {action: "User Reactivated", category: "Customers", details: "User account emily.chen@email.com reactivated"},
        {action: "Conflict Resolved", category: "Orders", details: "Conflict #CNF-001 resolved: partial refund of GHS 50"},
    ];
    const auditLogsData = auditActions.map((a, i) => ({
        ...a, user: rand(admins)._id, ip: `192.168.1.${randInt(1, 254)}`,
        createdAt: daysAgo(randInt(0, 30))
    }));
    const auditLogs = await AuditLog.insertMany(auditLogsData);
    console.log(`Created ${auditLogs.length} audit logs`);

    // ─── REFERRALS ───────────────────────────────────────
    const referralsData = [];
    for (let i = 0; i < clients.length; i++) {
        const referrer = clients[i];
        const code = `RUD-${referrer._id.toString().slice(-4).toUpperCase()}-${String(i).padStart(3, '0')}`;
        // Each client has a pending referral code
        referralsData.push({
            referrer: referrer._id, code,
            status: 'pending',
            reward: {type: 'fixed', value: 10, currency: 'GHS'}
        });
        // First 10 clients also have completed referrals
        if (i < 10) {
            const referred = clients[(i + 10) % clients.length];
            referralsData.push({
                referrer: referrer._id,
                referred: referred._id,
                code: `RUD-${referrer._id.toString().slice(-4).toUpperCase()}-C${String(i).padStart(2, '0')}`,
                status: 'completed',
                reward: {type: 'fixed', value: 10, currency: 'GHS'},
                completedAt: daysAgo(randInt(1, 60)),
                createdAt: daysAgo(randInt(30, 90))
            });
        }
    }
    const referrals = await Referral.insertMany(referralsData);
    console.log(`Created ${referrals.length} referrals`);

    // ─── SETTINGS ────────────────────────────────────────
    await Settings.create({
        store: {name: 'Ruderalis Medical', email: 'info@ruderalis.com', phone: '+233541000001', taxRate: 15, currency: 'GHS', timezone: 'GMT'},
        notifications: {newOrders: true, lowStock: true, licenseExpiry: true, newCustomers: false, dailySummary: true, staffActivity: false, systemUpdates: true}
    });
    console.log('Created settings');

    // ─── SUMMARY ─────────────────────────────────────────
    console.log("\n========================================");
    console.log("SEED COMPLETE!");
    console.log("========================================");
    console.log(`Admins:          ${admins.length}`);
    console.log(`Vendors:         ${vendors.length}`);
    console.log(`Clients:         ${clients.length}`);
    console.log(`Shops:           ${shops.length}`);
    console.log(`Products:        ${products.length}`);
    console.log(`Orders:          ${orders.length}`);
    console.log(`Reviews:         ${reviews.length}`);
    console.log(`Shop Reviews:    ${shopReviews.length}`);
    console.log(`Payments:        ${payments.length}`);
    console.log(`Testimonials:    ${testimonials.length}`);
    console.log(`FAQs:            ${faqs.length}`);
    console.log(`Messages:        ${messages.length}`);
    console.log(`Blogs:           ${blogs.length}`);
    console.log(`Coupons:         ${coupons.length}`);
    console.log(`Newsletters:     ${newsletters.length}`);
    console.log(`Wishlists:       ${wishlists.length}`);
    console.log(`Addresses:       ${addresses.length}`);
    console.log(`Payment Methods: ${paymentMethods.length}`);
    console.log(`Shop Visits:     ${visits.length}`);
    console.log(`Promotions:      ${promotions.length}`);
    console.log(`Batches:         ${batches.length}`);
    console.log(`Licenses:        ${licenses.length}`);
    console.log(`Dispensaries:    ${dispensaries.length}`);
    console.log(`Audit Logs:      ${auditLogs.length}`);
    console.log(`Referrals:       ${referrals.length}`);
    console.log("========================================");
    console.log("\nLOGIN CREDENTIALS (all accounts):");
    console.log(`Password: ${PASSWORD}`);
    console.log(`PIN: ${PIN}`);
    console.log("\nADMIN:   shay@ruderalis.com (super-admin)");
    console.log("VENDOR:  kwame@greenleaf.com");
    console.log("CLIENT:  john.smith@email.com");
    console.log("========================================\n");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
