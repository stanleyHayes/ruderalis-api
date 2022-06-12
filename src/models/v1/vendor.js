const mongoose = require("mongoose");
const validator = require("validator");

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error(`Invalid email`)
            }
        },
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isMobilePhone(value)){
                throw new Error(`Invalid phone number`)
            }
        },
        trim: true
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error('Password must include a lowercase, uppercase, digit, symbol and must be at least 8 characters long.')
            }
        }
    },
    pin: {
        type: String,
        required: true,
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
                updatedAt: {type: Date, default: Date.now()}
            }
        ]
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending', 'deleted', 'frozen'],
        default: 'pending'
    },
    address: {
        country: {
            type: String
        },
        region: {
            type: String
        },
        city: {
            type: String
        },
        street: {
            type: String
        },
        gpAddressOrHouseNumber: {
            type: String
        },
        landmark: {
            type: String
        }
    },
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
}, {timestamps: {createdAt: true, updatedAt: true}});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;