const path = require('path');
const fs = require('fs').promises;
const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const { Op } = require('sequelize');
const AccessoryModel = db.Accessory;
const CollectibleModel = db.Collectible;
const GameModel = db.Game;
const ProductModel = db.Product;

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'product_images');

exports.deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const productToDelete = await ProductModel.findOne({
            where: { product_id: productId },
            attributes: ['cover_image_url']
        });

        if (!productToDelete) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const imageUrl = productToDelete.cover_image_url;
        if (imageUrl && imageUrl !== 'placeholder.jpg') {
            const imagePath = path.join(UPLOAD_DIR, imageUrl);
            try {
                await fs.unlink(imagePath);
            } catch (fsError) {
                if (fsError.code !== 'ENOENT') console.error("Error deleting file:", fsError);
            }
        }
        await ProductModel.destroy({ where: { product_id: productId } });

        res.json({ success: true, message: 'Product deleted successfully.' });

    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ message: 'Database error during deletion.' });
    }
};

exports.createProduct = async (req, res) => {
    const body = req.body;
    const imageFile = req.files ? req.files.coverImage : null;
    let finalImageUrl = 'placeholder.jpg';

    if (imageFile) {
        try {
            const titleSlug = body.title.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            const typeSlug = (body.platform || body.product_type || 'item').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            const fileExtension = path.extname(imageFile.name);
            const fileName = `${titleSlug}_${typeSlug}_${Date.now()}${fileExtension}`;
            
            await imageFile.mv(path.join(UPLOAD_DIR, fileName));
            finalImageUrl = fileName;
        } catch (err) {
            console.error("File upload error:", err);
            return res.status(500).json({ message: 'Failed to save image file.' });
        }
    }

    const t = await sequelize.transaction();

    try {
        const newProduct = await ProductModel.create({
            title: body.title,
            price: body.price,
            stock_quantity: body.stock_quantity,
            product_type: body.product_type, 
            description_: body.description_,
            cover_image_url: finalImageUrl,
            is_active: 1
        }, { transaction: t });

        switch (body.product_type) {
            case 'game':
                await GameModel.create({
                    product_id: newProduct.product_id,
                    release_date: body.release_date ? new Date(body.release_date) : null,
                    developer: body.developer,
                    publisher: body.publisher,
                    genres: body.genres,
                    platform: body.platform
                }, { transaction: t });
                break;

            case 'collectible':
                await CollectibleModel.create({
                    product_id: newProduct.product_id,
                    collectible_type: body.collectible_type,
                    brand: body.brand
                }, { transaction: t });
                break;

            case 'accessory':
                await AccessoryModel.create({
                    product_id: newProduct.product_id,
                    accessory_type: body.accessory_type || body.type,
                    brand: body.brand
                }, { transaction: t });
                break;

            default:
                throw new Error('Invalid product type');
        }

        await t.commit();
        const responseData = { ...newProduct.dataValues, ...body };
        return res.status(201).json({ message: 'Product created successfully.', product: responseData });

    } catch (err) {
        if (t && !t.finished) await t.rollback();
        if (finalImageUrl !== 'placeholder.jpg') {
            try { await fs.unlink(path.join(UPLOAD_DIR, finalImageUrl)); } catch (e) {}
        }
        console.error("Create Error:", err);
        return res.status(500).json({ message: 'Database error: ' + err.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { productId } = req.params;
    const body = req.body;
    const imageFile = req.files ? req.files.coverImage : null;
    
    const t = await sequelize.transaction();

    try {
        let productData = {
            title: body.title,
            price: body.price,
            stock_quantity: body.stock_quantity,
            description_: body.description_
        };
        if (imageFile) {
            const titleSlug = body.title.trim().replace(/\s+/g, '_').toLowerCase();
            const fileName = `${titleSlug}_${Date.now()}${path.extname(imageFile.name)}`;
            await imageFile.mv(path.join(UPLOAD_DIR, fileName));
            productData.cover_image_url = fileName;
        }
        await ProductModel.update(productData, {
            where: { product_id: productId },
            transaction: t
        });

        const type = body.product_type;

        if (type === 'game') {
            await GameModel.update({
                developer: body.developer,
                publisher: body.publisher,
                genres: body.genres,
                platform: body.platform,
                release_date: body.release_date ? new Date(body.release_date) : null
            }, { where: { product_id: productId }, transaction: t });

        } else if (type === 'collectible') {
            await CollectibleModel.update({
                collectible_type: body.collectible_type,
                brand: body.brand
            }, { where: { product_id: productId }, transaction: t });

        } else if (type === 'accessory') {
            await AccessoryModel.update({
                accessory_type: body.accessory_type,
                brand: body.brand
            }, { where: { product_id: productId }, transaction: t });
        }

        await t.commit();
        const updatedProduct = { ...body, product_id: parseInt(productId), cover_image_url: productData.cover_image_url || body.cover_image_url };
        
        res.json({ success: true, message: 'Product updated successfully.', product: updatedProduct });

    } catch (err) {
        if (t && !t.finished) await t.rollback();
        console.error("Update Error:", err);
        return res.status(500).json({ success: false, message: 'Database error during update.' });
    }
};