const cloudinary = require("cloudinary").v2;

const keys = require("./../config/keys");

cloudinary.config(keys.cloudinaryURL);

const uploadImage = (image, options) => {
    return cloudinary.uploader.upload(image, options);
}

module.exports = {uploadImage};