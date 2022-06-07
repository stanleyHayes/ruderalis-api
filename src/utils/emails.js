const sgMail = require("@sendgrid/mail");
const keys = require("./../config/keys");

sgMail.setApiKey(keys.sendGridAPIKey);

exports.sendEmail = async (to, subject, text) => {
    const message = {
        to, subject, text, from: keys.sendGridFromEmail
    }
    return sgMail.send(message);
}