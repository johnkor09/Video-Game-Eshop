const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const ProductModel = db.Product;
const GameModel = db.Game;
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

exports.GetAllGames = async (req, res) => {
    const { platform } = req.params;
    
    const { sortBy } = req.query;  // get sort method
    if (!platform || platform === 'all') {
        try {
            Get_SortBy(sortBy);
            const products = await ProductModel.findAll({
                where: { is_active: 1, product_type: 'game' },
                attributes: ['product_id', 'title', 'price', 'cover_image_url', 'product_type'],
                include: [{
                    model: GameModel,
                    as: 'gameDetails',
                    attributes: ['platform']
                }],
                order: [[sortField, sortOrder]],
            });

            const flattened = products.map(p => ({
                product_id: p.product_id,
                title: p.title,
                price: p.price,
                cover_image_url: p.cover_image_url,
                platform: p.gameDetails ? p.gameDetails.platform : 'N/A',
                product_type: p.product_type
            }));
            return res.json(flattened);
            
        } catch (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }
    }
    const platformArray = platform.split(',');
    try {
        Get_SortBy(sortBy);
        const products = await ProductModel.findAll({
            where: { is_active: 1, product_type: 'game' },
            attributes: ['product_id', 'title', 'price', 'cover_image_url', 'product_type'],
            include: [{
                model: GameModel,
                as: 'gameDetails',
                where: { platform: { [Op.in]: platformArray } },
                attributes: ['platform']
            }],
            order: [[sortField, sortOrder]],
        });

        const flattened = products.map(p => ({
            product_id: p.product_id,
            title: p.title,
            price: p.price,
            cover_image_url: p.cover_image_url,
            platform: p.gameDetails ? p.gameDetails.platform : 'N/A',
            product_type: p.product_type
        }));
        return res.json(flattened);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
}