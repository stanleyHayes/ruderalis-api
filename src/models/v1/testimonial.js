const mongoose = require("mongoose");
const {Schema, model} = require("mongoose");

const testimonialSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    visible: {
        type: Boolean,
        default: false
    }
}, {timestamps: {createdAt: true, updatedAt: true}});


const Testimonial = model('Testimonial', testimonialSchema);

module.exports = Testimonial;