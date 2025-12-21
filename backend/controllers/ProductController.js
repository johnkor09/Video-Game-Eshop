const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const ProductModel = db.Product;
const GameModel = db.Game;
const AccessoryModel = db.Accessory;
const CollectibleModel = db.Collectible;

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

exports.GetSpecificProduct = async(req, res)=>{
    const { productId } = req.params;
        const { sortBy } = req.query;
    
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        try {
            Get_SortBy(sortBy);
            const product = await ProductModel.findOne({
                where: { product_id: productId },
                include: [
                    { model: GameModel, as: 'gameDetails' },
                    { model: AccessoryModel, as: 'accessoryDetails' },
                    { model: CollectibleModel, as: 'collectibleDetails' }
    
                ]
            });
            if (!product) {
                return res.status(404).json({ message: 'Game not found.' });
            }
    
            if (product.product_type === 'game') {
    
                const response = {
                    product_id: product.product_id,
                    title: product.title,
                    price: product.price,
                    stock_quantity: product.stock_quantity,
                    description_: product.description_,
                    cover_image_url: product.cover_image_url,
                    is_active: product.is_active,
                    developer: product.gameDetails?.developer,
                    publisher: product.gameDetails?.publisher,
                    genres: product.gameDetails?.genres,
                    platform: product.gameDetails?.platform,
                    release_date: product.gameDetails?.release_date,
                    product_type: product.product_type
                };
                res.json(response);
            }
    
            if (product.product_type === 'accessory') {
                const response = {
                    product_id: product.product_id,
                    title: product.title,
                    price: product.price,
                    stock_quantity: product.stock_quantity,
                    description_: product.description_,
                    cover_image_url: product.cover_image_url,
                    is_active: product.is_active,
                    brand: product.accessoryDetails?.brand,
                    product_type: product.product_type,
                    accessory_type: product.accessoryDetails.accessory_type
                };
                res.json(response);
            }
    
            if (product.product_type === 'collectible') {
                const response = {
                    product_id: product.product_id,
                    title: product.title,
                    price: product.price,
                    stock_quantity: product.stock_quantity,
                    description_: product.description_,
                    cover_image_url: product.cover_image_url,
                    is_active: product.is_active,
                    brand: product.collectibleDetails?.brand,
                    product_type: product.product_type,
                    collectible_type: product.collectibleDetails.collectible_type
                };
                res.json(response);
            }
    
        } catch (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }
}