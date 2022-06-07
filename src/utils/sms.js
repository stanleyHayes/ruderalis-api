const keys = require("./../config/keys");

const client = require("twilio")(keys.twilioAccountSID, keys.twilioAuthToken)
const sendSMS = async (to, message) => {
    return client.messages.create({to, from: keys.twilioPhoneNumber,body: message});
}

module.exports = {sendSMS}