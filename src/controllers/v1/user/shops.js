const Shop = require("./../../../models/v1/shop");
const User = require("./../../../models/v1/user");

const {checkPermission} = require("../../../utils/check-permission");
const {uploadImage} = require("./../../../utils/upload");

exports.createShop = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'shop', 'create'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        const {name, contact, description, image, destinations} = req.body;
        const uploadResult = uploadImage(image, {});
        const shop = await Shop.create({
            image: uploadResult.url,
            owner: req.user._id,
            name,
            contact,
            description,
            destinations
        });
        res.status(201).json({
            message: 'Shop Created Successfully',
            data: shop
        });
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getShop = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'shop', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})
        const {id} = req.params;
        const shop = await Shop.findById(id).populate(
            {path: 'owner', select: 'firstName lastName image phone email'
            });
        if(!shop)
            return res.status(404).json({message: 'Shop not found'});
        res.status(200).json({message: 'Shop Retrieved Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getShops = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'shop', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(200).json({message: 'Shops Retrieved Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateShop = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'shop', 'update'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(200).json({message: 'Shops Updated Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteShop = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'shop', 'remove'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(200).json({message: 'Shop Removed Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}