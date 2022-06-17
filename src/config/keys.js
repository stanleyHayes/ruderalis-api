const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    port: process.env.PORT,
    nodeENV: process.env.NODE_ENV,
    mongoDBURI: process.env.MONGO_DB_URI,
    jwtSecret: process.env.JWT_SECRET,
    otpLength: process.env.OTP_LENGTH,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioAccountSID: process.env.TWILIO_ACCOUNT_SID,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    sendGridAPIKey: process.env.SENDGRID_API_KEY,
    sendGridFromEmail: process.env.SENGRID_FROM_EMAIL,
    cloudinaryURL: process.env.CLOUDINARY_URL
}