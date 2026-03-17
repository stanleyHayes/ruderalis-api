const mongoose = require("mongoose");
const validator = require("validator");

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    active: {
        type: Boolean,
        default: true
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;
