const Blog = require("./../../../models/v1/blog");

exports.getBlogs = async (req, res) => {
    try {
        const match = {visible: true};
        if (req.query.category) {
            match['category'] = req.query.category;
        }
        if (req.query.tag) {
            match['tags'] = req.query.tag;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find(match)
            .select('-content')
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'author', select: 'firstName lastName fullName'});
        const totalBlogs = await Blog.countDocuments(match);
        res.status(200).json({message: 'Blogs retrieved successfully', data: blogs, count: totalBlogs});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({_id: req.params.id, visible: true})
            .populate({path: 'author', select: 'firstName lastName fullName'});
        if (!blog)
            return res.status(404).json({message: 'Blog not found'});
        res.status(200).json({message: 'Blog retrieved successfully', data: blog});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
