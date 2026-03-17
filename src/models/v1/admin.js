const mongoose = require("mongoose");
const validator = require("validator");

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isMobilePhone(value)) {
                throw new Error('Invalid phone number');
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error('Password must include a lowercase, uppercase, digit, symbol and must be at least 8 characters long.')
            }
        }
    },
    pin: {
        type: String,
        required: true
    },
    authInfo: {
        otp: {type: String},
        expiryDate: {type: Date},
        token: {type: String}
    },
    devices: {
        type: [
            {
                token: {type: String},
                ip: {type: String},
                source: {type: String},
                os: {type: String},
                isMobile: {type: Boolean},
                isDesktop: {type: Boolean},
                browser: {type: String},
                platform: {type: String}
            }
        ]
    },
    passwords: {
        type: [
            {
                password: {type: String},
                updatedAt: {type: Date, default: Date.now}
            }
        ]
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending', 'deleted'],
        default: 'pending'
    },
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin'
    },
    permissions: {
        users: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        shops: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        products: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        orders: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        reviews: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        shopReviews: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        testimonials: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        faqs: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        messages: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        admins: {
            create: {type: Boolean, default: false},
            read: {type: Boolean, default: false},
            update: {type: Boolean, default: false},
            remove: {type: Boolean, default: false}
        },
        settings: {
            create: {type: Boolean, default: false},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: false},
            remove: {type: Boolean, default: false}
        },
        payments: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        promotions: {
            create: {type: Boolean, default: true},
            read: {type: Boolean, default: true},
            update: {type: Boolean, default: true},
            remove: {type: Boolean, default: true}
        },
        dashboard: {
            read: {type: Boolean, default: true}
        }
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
