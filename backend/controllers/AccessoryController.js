const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const ProductModel = db.Product;
const accessoryModel = db.Accessory;
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

exports.GetAllaccessory = async (req, res) => {
    const { accessory_type } = req.params;
    const { sortBy } = req.query;  // get sort method
    if (!accessory_type || accessory_type === 'all') {
        try {
            Get_SortBy(sortBy);
            const products = await ProductModel.findAll({
                where: { is_active: 1, product_type: 'accessory' },
                attributes: ['product_id', 'title', 'price', 'cover_image_url', 'product_type'],
                include: [{
                    model: accessoryModel,
                    as: 'accessoryDetails',
                    attributes: ['accessory_type']
                }],
                order: [[sortField, sortOrder]],
            });

            const flattened = products.map(p => ({
                product_id: p.product_id,
                title: p.title,
                price: p.price,
                cover_image_url: p.cover_image_url,
                accessory_type: p.accessoryDetails ? p.accessoryDetails.accessory_type : 'N/A',
                product_type: p.product_type
            }));
            res.json(flattened)
            return;
        } catch (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }
    }
    const accessory_typeArray = accessory_type.split(',');
    try {
        Get_SortBy(sortBy);
        const products = await ProductModel.findAll({
            where: { is_active: 1, product_type: 'accessory' },
            attributes: ['product_id', 'title', 'price', 'cover_image_url', 'product_type'],
            include: [{
                model: accessoryModel,
                as: 'accessoryDetails',
                where: { accessory_type: { [Op.in]: accessory_typeArray } },
                attributes: ['accessory_type']
            }],
            order: [[sortField, sortOrder]],
        });

        const flattened = products.map(p => ({
            product_id: p.product_id,
            title: p.title,
            price: p.price,
            cover_image_url: p.cover_image_url,
            accessory_type: p.accessoryDetails ? p.accessoryDetails.accessory_type : 'N/A',
            product_type: p.product_type
        }));
        res.json(flattened)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
}