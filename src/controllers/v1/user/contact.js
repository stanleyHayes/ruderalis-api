const Message = require("./../../../models/v1/message");

exports.submitContactForm = async (req, res) => {
    try {
        const {name, email, phone, subject, text} = req.body;
        if (!subject || !text || !email)
            return res.status(400).json({message: 'Email, subject and message are required'});
        const message = await Message.create({
            user: req.user ? req.user._id : null,
            subject: `[Contact] ${subject}`,
            text: `From: ${name || 'Anonymous'} (${email}${phone ? ', ' + phone : ''})\n\n${text}`
        });
        res.status(201).json({message: 'Message sent successfully', data: message});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
