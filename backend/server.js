let express = require('express');
let cors = require('cors');
let app = express();
let port = 4000;
const { sequelize } = require('./config/db');
const db = require('./models/index')(sequelize);
const ProductModel = db.Product;
const GameModel = db.Game;
const CollectibleModel = db.Collectible;
const OrdersModel = db.Order;
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const path = require('path');
const { platform } = require('os');
const fs = require('fs').promises;
require('dotenv').config(); // Για να διαβάζει το .env
const gameRoutes = require('./routes/GameRoutes');
const cartRoutes = require('./routes/CartRoutes');
const productRoutes = require('./routes/ProductRoutes');
const authRoutes = require('./routes/AuthRoutes');
const { authenticateToken, checkAuthAndAdmin } = require('./middleware/auth');
app.use(cors());
app.use(express.json());

app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/product', productRoutes);

let sortField = 'product_id';
let sortOrder = 'DESC';
function Get_SortBy(sortBy) {
    if (sortBy === 'Low-High') {
        sortField = 'price';
        sortOrder = 'ASC'; //ascending
    } else if (sortBy === 'High-Low') {
        sortField = 'price';
        sortOrder = 'DESC';//descending
    } else if (sortBy === 'Recent') {
        sortField = 'product_id';
        sortOrder = 'DESC';//descending
    } else if (sortBy === 'Alphabetical') {
        sortField = 'title';
        sortOrder = 'ASC';
    }
}


app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Μέγιστο 5MB
    abortOnLimit: true,
    createParentPath: true,
}));
const UPLOAD_DIR = path.join(__dirname, '..', 'frontend', 'public', 'game_images');

app.delete('/api/games/:gameId', checkAuthAndAdmin, async (req, res) => {
    const gameId = req.params.gameId;

    try {
        const productToDelete = await ProductModel.findOne({
            where: { product_id: gameId },
            attributes: ['cover_image_url']
        });

        if (!productToDelete) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        const imageUrl = productToDelete.cover_image_url;

        if (imageUrl && imageUrl !== 'placeholder.jpg') {
            const imagePath = path.join(UPLOAD_DIR, imageUrl);

            try {
                await fs.unlink(imagePath);
                console.log(`Εικόνα διαγράφηκε επιτυχώς: ${imagePath}`);
            } catch (fsError) {
                if (fsError.code === 'ENOENT') {
                    console.warn(`Προσοχή: Το αρχείο εικόνας ${imagePath} δεν βρέθηκε στον δίσκο.`);
                } else {
                    console.error("Σφάλμα διαγραφής αρχείου:", fsError);
                }
            }
        }

        const deletedCount = await ProductModel.destroy({
            where: { product_id: gameId }
        });

        if (deletedCount > 0) {
            return res.json({ success: true, message: 'Game deleted successfully.' });
        } else {
            return res.status(404).json({ message: 'Game not found.' });
        }
    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ message: 'Database error during deletion.' });
    }
});

app.post('/api/games/upload', checkAuthAndAdmin, async (req, res) => {
    const game = req.body;
    const imageFile = req.files ? req.files.coverImage : null;
    let finalImageUrl = 'placeholder.jpg';

    if (imageFile) {
        const titleSlug = game.title.trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();
        const platformSlug = game.platform.trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();
        const fileExtension = path.extname(imageFile.name);
        const fileName = `${titleSlug}_${platformSlug}${fileExtension}`;
        const uploadPath = path.join(UPLOAD_DIR, fileName);

        try {
            // Αποθήκευση του αρχείου στον δίσκο
            await imageFile.mv(uploadPath);
            finalImageUrl = fileName; // Αποθηκεύουμε μόνο το όνομα/path στη DB
            console.log(`Το αρχείο αποθηκεύτηκε ως: ${fileName}`);
        } catch (err) {
            console.error("File upload error:", err);
            return res.status(500).json({ message: 'Αποτυχία αποθήκευσης αρχείου στον δίσκο.' });
        }
    } else {
        // Αν δεν ανέβηκε φωτογραφία, ίσως θέλετε ένα default όνομα:
        finalImageUrl = 'placeholder.jpg';
    }
    const t = await sequelize.transaction();

    try {
        const newProduct = await ProductModel.create({
            title: game.title,
            price: game.price,
            stock_quantity: game.stock_quantity,
            product_type: 'game', // Σημαντικό!
            description_: game.description_,
            cover_image_url: finalImageUrl,
            is_active: 1
        }, { transaction: t });

        await GameModel.create({
            product_id: newProduct.product_id, // Το ID από το Product
            release_date: game.release_date ? new Date(game.release_date) : null,
            developer: game.developer,
            publisher: game.publisher,
            genres: game.genres,
            platform: game.platform
        }, { transaction: t });
        await t.commit();

        const flatGame = {
            product_id: newProduct.product_id,
            title: newProduct.title,
            is_active: newProduct.is_active,
            product_type: newProduct.product_type,
            platform: game.platform
        };

        return res.status(201).json({
            message: 'Το παιχνίδι δημιουργήθηκε επιτυχώς.',
            game: flatGame
        });
    } catch (err) {
        if (t && !t.finished) await t.rollback();
        console.error("Create Error:", err);
        return res.status(500).json({ message: 'Database error during creation.' });
    }
});

app.put('/api/games/:gameId', checkAuthAndAdmin, async (req, res) => {
    const gameId = req.params.gameId;
    const game = req.body;
    const imageFile = req.files ? req.files.coverImage : null;
    const t = await sequelize.transaction();
    try {
        let productData = {
            title: game.title,
            price: game.price,
            stock_quantity: game.stock_quantity,
            description_: game.description_
        };

        if (imageFile) {
            const titleSlug = game.title.trim().replace(/\s+/g, '_').toLowerCase();
            const fileName = `${titleSlug}_${Date.now()}${path.extname(imageFile.name)}`;
            const uploadPath = path.join(UPLOAD_DIR, fileName);
            await imageFile.mv(uploadPath);
            productData.cover_image_url = fileName;
        }

        await ProductModel.update(productData, {
            where: { product_id: gameId },
            transaction: t
        });

        await GameModel.update({
            developer: game.developer,
            publisher: game.publisher,
            genres: game.genres,
            platform: game.platform,
            release_date: game.release_date ? new Date(game.release_date) : null
        }, {
            where: { product_id: gameId },
            transaction: t
        });

        await t.commit();

        const rawGame = await ProductModel.findOne({
            where: { product_id: gameId },
            include: [{
                model: GameModel,
                as: 'gameDetails'
            }]
        });

        const flatGame = {
            product_id: rawGame.product_id,
            title: rawGame.title,
            price: rawGame.price,
            stock_quantity: rawGame.stock_quantity,
            description_: rawGame.description_,
            cover_image_url: rawGame.cover_image_url,
            is_active: rawGame.is_active,
            developer: rawGame.gameDetails ? rawGame.gameDetails.developer : null,
            publisher: rawGame.gameDetails ? rawGame.gameDetails.publisher : null,
            genres: rawGame.gameDetails ? rawGame.gameDetails.genres : null,
            platform: rawGame.gameDetails ? rawGame.gameDetails.platform : null,
            release_date: rawGame.gameDetails ? rawGame.gameDetails.release_date : null
        };

        return res.json({
            success: true,
            message: 'Game updated successfully.',
            game: flatGame
        });

    } catch (err) {
        if (t && !t.finished) await t.rollback();
        console.error("Update Error:", err);
        return res.status(500).json({ success: false, message: 'Database error during update.' });
    }

});



app.get('/api/collectibles', async (req, res) => {
    const { sortBy } = req.query;  // get sort method
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
            collectible_type: p.collectibleDetails ? p.collectibleDetails.collectible_type : '---'
        }));
        res.json(flattened)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
})




app.get('/api/game/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        console.log('Searching for product:', gameId);
        const game = await ProductModel.findOne({
            where: { product_id: gameId, product_type: 'game' },
            include: [{
                model: GameModel,
                as: 'gameDetails'
            }]
        });
        if (!game) return res.status(404).json({ message: 'Game not found.' });
        console.log('done');

        console.log('Record found, flattening response...');

        const response = {
            product_id: game.product_id,
            title: game.title,
            price: game.price,
            stock_quantity: game.stock_quantity,
            description_: game.description_,
            cover_image_url: game.cover_image_url,
            is_active: game.is_active,
            product_type: game.product_type,
            developer: game.gameDetails.developer,
            publisher: game.gameDetails.publisher,
            genres: game.gameDetails.genres,
            platform: game.gameDetails.platform,
            release_date: game.gameDetails.release_date
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

// app for orders
app.post('/api/orders/new', async (req, res) => {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order must contain products.' });
    }    
    const totalAmount = items.reduce((total, item) => total + item.quantity * item.unit_price, 0);
    const transaction = await sequelize.transaction();
    try {
      
        const newOrder = await OrdersModel.create({
            user_id: userId,
            total_amount: totalAmount,
            status: 'Pending', // Default status
        }, { transaction });

        
        const orderItems = items.map(item => ({
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        await OrderItemsModel.bulkCreate(orderItems, { transaction });

       
        await transaction.commit();

        // Return a response with the created order
        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            order_id: newOrder.order_id,
        });
    } catch (err) {
        // Rollback the transaction in case of an error
        await transaction.rollback();

        console.error('Error creating the order:', err);
        res.status(500).json({ success: false, message: 'Failed to create order.' });
    }

});

app.get('/api/orders/content', authenticateToken, async (req, res) => {
    const userID = req.user.id;
    try {
        const order = await OrdersModel.findAll({
            where: {
                user_id: userID,
            }, include: {
                model: OrderItemsModel,
                attributes: ['product_id', 'quantity', 'unit_price'],
            },
            attributes: ['order_id', 'price', 'created_at', 'user_id'],
        });

        if (orders.length === 0) {
            return res.json({ success: false, message: 'No orders found for this user.' });
        }

        res.json(order);
    } catch (err) {
        console.error('Error with sending cart items', err);
        return res.json({ success: false, message: 'Error with getting cart items' });
    }
});


app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});