const Testimonial = require("./../../../models/v1/testimonial");

exports.getTestimonials = async (req, res) => {
    try {
        const match = {};
        if (req.query.visible !== undefined) {
            match['visible'] = req.query.visible === 'true';
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 20;
        const skip = (page - 1) * limit;

        const testimonials = await Testimonial.find(match)
            .skip(skip).limit(limit).sort({createdAt: -1})
            .populate({path: 'user', select: 'firstName lastName fullName'});
        const totalTestimonials = await Testimonial.countDocuments(match);
        res.status(200).json({message: 'Testimonials retrieved successfully', data: testimonials, count: totalTestimonials});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id)
            .populate({path: 'user', select: 'firstName lastName fullName'});
        if (!testimonial)
            return res.status(404).json({message: 'Testimonial not found'});
        res.status(200).json({message: 'Testimonial retrieved successfully', data: testimonial});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.toggleVisibility = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial)
            return res.status(404).json({message: 'Testimonial not found'});
        testimonial.visible = !testimonial.visible;
        await testimonial.save();
        res.status(200).json({message: `Testimonial visibility set to ${testimonial.visible}`, data: testimonial});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial)
            return res.status(404).json({message: 'Testimonial not found'});
        await testimonial.deleteOne();
        res.status(200).json({message: 'Testimonial deleted successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
