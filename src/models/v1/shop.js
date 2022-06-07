const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const validator = require("validator");


const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor'
    },
    contact: {
        phone: {
            type: String,
            required: true,
            trim: true,
            validate(value){
                if(!validator.isMobilePhone(value)){
                    throw new Error(`Invalid phone number`);
                }
            },
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error(`Invalid phone`);
                }
            },
        }
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'suspended', 'frozen', 'deleted', 'active'],
        default: 'pending'
    },
    image: {type: String, required: true},
    rank: {
        type: Number,
        default: 1
    },
    featured: {
        value: {
            type: Boolean,
            default: false
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;