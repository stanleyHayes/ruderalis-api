const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    category: {
        type: String,
        trim: true
    },
    tags: [{type: String, trim: true}],
    visible: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    }
}, {timestamps: {createdAt: true, updatedAt: true}});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
