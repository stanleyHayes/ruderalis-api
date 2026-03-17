const FAQ = require("./../../../models/v1/faq");

exports.createFAQ = async (req, res) => {
    try {
        const {question, answer, category, visible, order} = req.body;
        if (!question || !answer)
            return res.status(400).json({message: 'Question and answer are required'});
        const faq = await FAQ.create({
            question, answer, category, visible, order,
            createdBy: req.admin._id
        });
        res.status(201).json({message: 'FAQ created successfully', data: faq});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getFAQs = async (req, res) => {
    try {
        const match = {};
        if (req.query.visible !== undefined) {
            match['visible'] = req.query.visible === 'true';
        }
        if (req.query.category) {
            match['category'] = req.query.category;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;

        const faqs = await FAQ.find(match)
            .skip(skip).limit(limit).sort({order: 1, createdAt: -1})
            .populate({path: 'createdBy', select: 'firstName lastName fullName'});
        const totalFAQs = await FAQ.countDocuments(match);
        res.status(200).json({message: 'FAQs retrieved successfully', data: faqs, count: totalFAQs});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id)
            .populate({path: 'createdBy', select: 'firstName lastName fullName'});
        if (!faq)
            return res.status(404).json({message: 'FAQ not found'});
        res.status(200).json({message: 'FAQ retrieved successfully', data: faq});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq)
            return res.status(404).json({message: 'FAQ not found'});
        const updates = Object.keys(req.body);
        const allowedUpdates = ['question', 'answer', 'category', 'visible', 'order'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed)
            return res.status(400).json({message: 'Update not allowed'});
        for (let key of updates) {
            faq[key] = req.body[key];
        }
        await faq.save();
        res.status(200).json({message: 'FAQ updated successfully', data: faq});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq)
            return res.status(404).json({message: 'FAQ not found'});
        await faq.deleteOne();
        res.status(200).json({message: 'FAQ deleted successfully'});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
