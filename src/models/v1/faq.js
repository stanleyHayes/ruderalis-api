const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    visible: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
