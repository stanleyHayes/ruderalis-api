const FAQ = require("./../../../models/v1/faq");

exports.getFAQs = async (req, res) => {
    try {
        const match = {visible: true};
        if (req.query.category) {
            match['category'] = req.query.category;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 50;
        const skip = (page - 1) * limit;

        const faqs = await FAQ.find(match)
            .skip(skip).limit(limit).sort({order: 1, createdAt: -1});
        const totalFAQs = await FAQ.countDocuments(match);
        res.status(200).json({message: 'FAQs retrieved successfully', data: faqs, count: totalFAQs});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

exports.getFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findOne({_id: req.params.id, visible: true});
        if (!faq)
            return res.status(404).json({message: 'FAQ not found'});
        res.status(200).json({message: 'FAQ retrieved successfully', data: faq});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
