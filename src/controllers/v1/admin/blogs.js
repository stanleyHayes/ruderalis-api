const Blog = require("./../../../models/v1/blog");

exports.createBlog = async (req, res) => {
    try {
        const {title, content, summary, image, category, tags, visible} = req.body;
        if (!title || !content)
            return res.status(400).json({message: 'Title and content are required'});
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const blog = await Blog.create({
            title, content, summary, image, category, tags, visible,
            slug, author: req.admin._id
        });
        res.status(201).json({message: 'Blog created successfully', data: blog});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getBlogs = async (req, res) => {
    try {
        const match = {};
        if (req.query.visible !== undefined) match['visible'] = req.query.visible === 'true';
        if (req.query.category) match['category'] = req.query.category;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'author', select: 'firstName lastName fullName'});
        const total = await Blog.countDocuments(match);
        res.status(200).json({message: 'Blogs retrieved', data: blogs, count: total});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate({path: 'author', select: 'firstName lastName fullName'});
        if (!blog) return res.status(404).json({message: 'Blog not found'});
        res.status(200).json({message: 'Blog retrieved', data: blog});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({message: 'Blog not found'});
        const allowed = ['title', 'content', 'summary', 'image', 'category', 'tags', 'visible'];
        for (let key of Object.keys(req.body)) {
            if (allowed.includes(key)) blog[key] = req.body[key];
        }
        if (req.body.title) blog.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await blog.save();
        res.status(200).json({message: 'Blog updated', data: blog});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({message: 'Blog not found'});
        await blog.deleteOne();
        res.status(200).json({message: 'Blog deleted'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
