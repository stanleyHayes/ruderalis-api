const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
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
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email');
            }
        }
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate(value){
            if(!validator.isMobilePhone(value)){
                throw new Error('Invalid phone number');
            }
        }
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
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const User = mongoose.model("User", userSchema);

module.exports = User;