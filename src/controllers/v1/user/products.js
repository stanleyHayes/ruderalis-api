const Product = require("./../../../models/v1/product");
const User = require("./../../../models/v1/user");

const {checkPermission} = require("../../../utils/check-permission");

exports.createProduct = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'product', 'create'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(201).json({message: 'Product Created Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getProduct = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'product', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(200).json({message: 'Product Retrieved Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.getProducts = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'product', 'read'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(200).json({message: 'Products Retrieved Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.updateProduct = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'product', 'update'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(200).json({message: 'Products Updated Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        if(!checkPermission(req.user, 'product', 'remove'))
            return res.status(400).json({message: 'User does not have permission to complete the requested task'})

        res.status(200).json({message: 'Product Removed Successfully', data: {}});
    }catch (e) {
        res.status(500).json({message: e.message});
    }
}