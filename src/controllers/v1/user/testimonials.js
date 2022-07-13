const Testimonial = require("./../../../models/v1/testimonial");
const {checkPermission} = require("../../../utils/check-permission");

exports.createTestimonial = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'testimonial', 'create'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const {product, text, rating} = req.body;
        if (rating < 0 || rating > 5)
            return res.status(400).json({message: 'Rating should be between 0 and 5'});
        const existingTestimonial = await Testimonial.findOne({user: req.user._id, product});
        if (existingTestimonial)
            return res.status(400).json({message: 'You have already submitted a testimonial for this app'});
        const createdTestimonial = await Testimonial.create({
            user: req.user._id, product, text, rating
        });
        res.status(201).json({message: 'Testimonial created successfully.', data: createdTestimonial});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getTestimonial = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'testimonial', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const testimonial = await Testimonial.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName'});
        if (!testimonial)
            return res.status(404).json({message: 'Testimonial not found'});
        res.status(200).json({message: 'Testimonial successfully retrieved'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getTestimonials = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'testimonial', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const match = {};
        if (req.query.visible) {
            match['visible'] = req.query.visible === 'true';
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const testimonials = await Testimonial.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'fullName'})
            .populate({path: 'product', select: 'name'});

        const totalTestimonials = await Testimonial.find(match).countDocuments();
        res.status(200).json({
            message: 'Testimonials retrieved successfully',
            data: testimonials,
            count: totalTestimonials
        })
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateTestimonial = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'testimonial', 'read'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const testimonial = await Testimonial.findById(req.params.id)
            .populate({path: 'user'});
        if (!testimonial)
            return res.status(404).json({message: 'Testimonial not found'});
        if (req.user.role === 'user' || req.user.role === 'vendor') {
            if (req.user._id !== testimonial.user._id)
                return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
            const updates = Object.keys(req.body);
            const allowedUpdates = ['rating', 'text'];
            const isAllowed = updates.every(update => allowedUpdates.includes(update));
            if (!isAllowed)
                return res.status(400).json({message: 'Updates not allowed'});
            for (let key of updates) {
                if (key === 'rating') {
                    if (req.body['rating'] < 0 || req.body['rating'] > 5)
                        return res.status(400).json({message: 'Rating should be between 0 and 5'});
                }
                testimonial[key] = req.body[key];
            }
            testimonial['visible'] = false;
            await testimonial.save();
            return res.status(200).json({message: 'Testimonial updated successfully'});
        }
        const updates = Object.keys(req.body);
        const allowedUpdates = ['visible'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Updates not allowed'});
        for (let key of updates) {
            testimonial[key] = req.body[key];
        }
        await testimonial.save();
        return res.status(200).json({message: 'Testimonial updated successfully', data: testimonial});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteTestimonial = async (req, res) => {
    try {
        if (!checkPermission(req.user, 'testimonial', 'remove'))
            return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
        const testimonial = await Testimonial.findById(req.params.id)
            .populate({path: 'user'});
        if (!testimonial)
            return res.status(404).json({message: 'Testimonial not found'});
        if (req.user.role === 'user' || req.user.role === 'vendor') {
            if (req.user._id !== testimonial.user._id)
                return res.status(403).json({message: "You don't have enough permissions to perform this operation"});
            await testimonial.remove();
            return res.status(200).json({message: 'Testimonial removed successfully', data: testimonial});
        }
        await testimonial.remove();
        return res.status(200).json({message: 'Testimonial removed successfully', data: testimonial});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}