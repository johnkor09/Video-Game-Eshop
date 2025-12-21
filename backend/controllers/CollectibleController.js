const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const ProductModel = db.Product;
const CollectibleModel = db.Collectible;
const { Op } = require('sequelize');

let sortField = 'product_id';
let sortOrder = 'DESC';

function Get_SortBy(sortBy) {
    if (sortBy === 'Low-High') {
        sortField = 'price';
        sortOrder = 'ASC';
    } else if (sortBy === 'High-Low') {
        sortField = 'price';
        sortOrder = 'DESC';
    } else if (sortBy === 'Recent') {
        sortField = 'product_id';
        sortOrder = 'DESC';
    } else if (sortBy === 'Alphabetical') {
        sortField = 'title';
        sortOrder = 'ASC';
    }
}

exports.GetAllcollectibles = async (req, res) => {
    const { collectible_type } = req.params;
    const { sortBy } = req.query;  // get sort method
    if (!collectible_type || collectible_type === 'all') {
        try {
            Get_SortBy(sortBy);
            const products = await ProductModel.findAll({
                where: { is_active: 1, product_type: 'collectible' },
                attributes: ['product_id', 'title', 'price', 'cover_image_url', 'product_type'],
                include: [{
                    model: CollectibleModel,
                    as: 'collectibleDetails',
                    attributes: ['collectible_type']
                }],
                order: [[sortField, sortOrder]],
            });

            const flattened = products.map(p => ({
                product_id: p.product_id,
                title: p.title,
                price: p.price,
                cover_image_url: p.cover_image_url,
                collectible_type: p.collectibleDetails ? p.collectibleDetails.collectible_type : 'N/A',
                product_type: p.product_type
            }));
            res.json(flattened)
            return;
        } catch (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }
    }
    const collectible_typeArray = collectible_type.split(',');
    try {
        Get_SortBy(sortBy);
        const products = await ProductModel.findAll({
            where: { is_active: 1, product_type: 'collectible' },
            attributes: ['product_id', 'title', 'price', 'cover_image_url', 'product_type'],
            include: [{
                model: CollectibleModel,
                as: 'collectibleDetails',
                where: { collectible_type: { [Op.in]: collectible_typeArray } },
                attributes: ['collectible_type']
            }],
            order: [[sortField, sortOrder]],
        });

        const flattened = products.map(p => ({
            product_id: p.product_id,
            title: p.title,
            price: p.price,
            cover_image_url: p.cover_image_url,
            collectible_type: p.collectibleDetails ? p.collectibleDetails.collectible_type : 'N/A',
            product_type: p.product_type
        }));
        res.json(flattened)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
}