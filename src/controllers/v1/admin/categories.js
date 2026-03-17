const Product = require("./../../../models/v1/product");

const CATEGORY_META = {
    'Flower': {description: 'Premium cannabis buds', image: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=200&h=200&fit=crop'},
    'Edibles': {description: 'Infused food & beverages', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop'},
    'Concentrates': {description: 'Extracts, wax & shatter', image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&h=200&fit=crop'},
    'Topicals': {description: 'Creams, balms & patches', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop'},
    'Pre-Rolls': {description: 'Ready-to-smoke joints', image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=200&fit=crop'},
    'Tinctures': {description: 'Sublingual drops & oils', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'},
    'Vapes': {description: 'Cartridges & disposables', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop'},
    'Accessories': {description: 'Pipes, papers & tools', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop'}
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.aggregate([
            {$match: {status: {$ne: 'deleted'}}},
            {$group: {_id: '$category', productCount: {$sum: 1}}},
            {$sort: {productCount: -1}}
        ]);

        const data = categories.map(c => {
            const name = c._id || 'Uncategorized';
            const meta = CATEGORY_META[name] || {description: '', image: ''};
            return {name, productCount: c.productCount, description: meta.description, image: meta.image};
        });

        res.status(200).json({message: 'Categories retrieved', data});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}
