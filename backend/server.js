let express = require('express');
let cors = require('cors');
let app = express();
let port = 4000;
const { sequelize } = require('./config/db');
const db = require('./models/index')(sequelize);
const ProductModel = db.Product;
const UserModel = db.User;
const GameModel = db.Game;
const CartModel = db.Cart;
const AccessoryModel = db.Accessory;
const CollectibleModel = db.Collectible;
const CartItemModel = db.CartItem;
const OrdersModel = db.Orders;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const fileUpload = require('express-fileupload');
const path = require('path');
const { platform } = require('os');
const fs = require('fs').promises;
require('dotenv').config(); // Για να διαβάζει το .env

// αυτο ειναι το μυστικο κλειδι κρυπτογραφησης jwt και καποια στιγμη πρεπει να το βαλουμε σε .env αρχειο
const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';

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
app.use(cors());
app.use(express.json());

app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Μέγιστο 5MB
    abortOnLimit: true,
    createParentPath: true,
}));
const UPLOAD_DIR = path.join(__dirname, '..', 'frontend', 'public', 'game_images');

function checkAuthAndAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role === 1) {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden. Admin access required.' });
        }
    } catch (ex) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

app.post('/api/login', async (req, res) => {
    //εδω τσεκαρει αν υπαρχει ο χρηστης με τα στοιχεια αυτα
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({
            where: {
                email: email,
                password_: password
            },
            attributes: ['user_id', 'first_name', 'email', 'admin_status']
        });

        if (user) {
            const data = {
                id: user.user_id,
                name: user.first_name,
                email: user.email,
                role: user.admin_status
            };
            const token = jwt.sign(data, JWT_SECRET, { expiresIn: '2h' });

            return res.json({
                success: true,
                message: "Logged in successfully:)",
                token: token, // το κρυπτογραφημενο token
                user: data // στελνει και τα user data για ευκολια
            });
        } else {//αν δεν βρει χρηστη
            return res.status(401).json({
                success: false,
                message: "Wrong email or password."
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error');
    }
});

app.post('/api/signup', async (req, res) => {
    //εδω τσεκαρει αν υπαρχει ο χρηστης με τα στοιχεια αυτα
    const { name, surname, email, pass1 } = req.body;
    try {
        const existingUser = await UserModel.findOne({ where: { email: email } });

        if (existingUser) {
            return res.json({
                success: false,
                message: "Email already in use!"
            });
        }

        const newUser = await UserModel.create({
            password_: pass1,
            first_name: name,
            surname: surname,
            email: email,
            admin_status: 0
        });

        const data = {
            id: newUser.user_id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.admin_status
        };

        const token = jwt.sign(data, JWT_SECRET, { expiresIn: '2h' });

        return res.json({
            success: true,
            message: "Logged in successfully :)",
            token: token,
            user: data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }

});

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

app.delete('/api/cart/removeItem', authenticateToken, async (req, res) => {
    const itemId = req.body.itemId;
    const userId = req.user.id;
    const parseditemId = parseInt(itemId);
    if (!parseditemId || parseditemId <= 0) {
        return res.status(400).json({ message: 'Μη έγκυρο Cart item ID.' });
    }

    try {
        const cart = await CartModel.findOne({
            where: { user_id: userId },
            attributes: ['cart_id']
        });

        if (!cart) {
            return res.status(400).json({ message: 'Δεν βρεθηκε το cart για τον χρηστη ' + userId });
        }
        const cartId = cart.cart_id;

        const deletedCount = await CartItemModel.destroy({
            where: {
                item_id: parseditemId,
                cart_id: cartId
            }
        });
        if (deletedCount > 0) {
            return res.status(200).json({ message: 'Item in cart removed successfully.' });
        } else {
            return res.status(400).json({ message: 'Cart item not found.' });
        }
    } catch (err) {
        console.error("Item removal Error:", err);
        return res.status(500).json({ message: 'Database error during removal.' });
    }
});

app.put('/api/cart/changeQuantity', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const itemId = req.body.itemId;
    const quantity = req.body.NewQuantity
    const parsedItemId = parseInt(itemId);
    const newQuantity = parseInt(quantity);

    if (!parsedItemId || parsedItemId <= 0 || !newQuantity || newQuantity <= 0) {
        return res.status(400).json({ message: 'invalid item id or invalid quantity' });
    }
    try {
        const cart = await CartModel.findOne({
            where: { user_id: userId }
        });

        if (!cart) {
            return res.status(400).json({ message: 'no cart found for user ' + userId });
        }
        const cart_id = cart.cart_id;

        const cartItem = await CartItemModel.findOne({
            where: { item_id: parsedItemId, cart_id: cart_id },
            include: [{
                model: ProductModel,
                as: 'product' // Σύνδεση με Product για το stock
            }]
        });

        const availableStock = cartItem.product.stock_quantity;

        if (newQuantity > availableStock) {
            return res.status(400).json({
                message: 'Not available Stock. Max stock: ' + availableStock,
                maxQuantity: availableStock
            });
        }

        await cartItem.update({ quantity: newQuantity });

        return res.status(200).json({
            message: 'Quantity updated succesfully to ' + newQuantity,
            cartItem: cartItem
        });
    } catch (err) {
        console.error("Cart Update Error:", err);
        return res.status(500).json({ message: 'Quantity update issue' });
    }
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const parsedproductId = parseInt(productId);
    const parsedQuantity = parseInt(quantity);

    if (!parsedproductId || isNaN(parsedproductId) || parsedQuantity < 1 || isNaN(parsedQuantity)) {
        return res.status(400).json({ message: 'Μη έγκυρο Game ID ή Ποσότητα.' });
    }

    try {
        const product = await ProductModel.findByPk(parsedproductId);

        if (!product || product.is_active === 0) {
            return res.status(400).json({ message: 'Product not found or unavailable!' });
        }

        if (product.stock_quantity < parsedQuantity) {
            return res.status(400).json({ message: 'No stock available' });
        }

        const [cart] = await CartModel.findOrCreate({ where: { user_id: userId } });

        const [cartItem, itemCreated] = await CartItemModel.findOrCreate({
            where: {
                cart_id: cart.cart_id,
                product_id: parsedproductId
            },
            defaults: {
                cart_id: cart.cart_id,
                product_id: parsedproductId,
                quantity: parsedQuantity,
                price_at_addition: product.price
            }
        });

        if (!itemCreated) {
            const totalRequestedQuantity = cartItem.quantity + parsedQuantity;

            if (product.stock_quantity < totalRequestedQuantity) {
                return res.status(400).json({ message: 'No more stock available' });
            }

            await cartItem.update({ quantity: totalRequestedQuantity });

            return res.status(200).json({
                message: 'Quantity of item was updated to ' + totalRequestedQuantity,
                cartItem: cartItem
            });
        }

        return res.status(201).json({
            message: 'Item added to cart.',
            cartItem: cartItem
        });
    } catch (err) {
        console.error('Cart error', err);
        return res.status(500).json({ message: 'Error adding item to cart!' });
    }
});

app.get('/api/cart/content', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const [cart] = await CartModel.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId }
        });

        const cartItemsList = await CartItemModel.findAll({
            where: { cart_id: cart.cart_id },
            include: [{
                model: ProductModel,
                as: 'product',
                attributes: ['product_id', 'title', 'price', 'cover_image_url', 'stock_quantity'],
                include: [{
                    model: GameModel,
                    as: 'gameDetails',
                    attributes: ['platform']
                }]
            }],
            order: [['item_id', 'ASC']]
        });

        if (cartItemsList.length > 0) {
            const response = cartItemsList.map(item => ({
                item_id: item.item_id,
                quantity: item.quantity,
                price_at_addition: item.price_at_addition,
                product_id: item.product.product_id,
                title: item.product.title,
                cover_image_url: item.product.cover_image_url,
                stock_quantity: item.product.stock_quantity,
                platform: item.product.gameDetails ? item.product.gameDetails.platform : 'N/A'
            }));
            return res.status(200).json(response);
        }
        else {
            return res.status(200).json([]);
        }
    } catch (err) {
        console.error('Error with sending cart items', err);
        return res.json({ success: false, message: 'Error with getting cart items' });
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

app.get('/api/product/:productId', async (req, res) => {
    const {  productId } = req.params;
    const { sortBy } = req.query;

    if (isNaN(parseInt(productId))) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    try {
        Get_SortBy(sortBy);
        const product = await ProductModel.findOne({
            where: { product_id: productId},
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

        if(product.product_type === 'accessory'){
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
                accessory_type: product.collectible_type
            };
            res.json(response);
        }

        if(product.product_type === 'collectible'){
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
});

app.get('/api/games/:platform', async (req, res) => {
    const {platform} = req.params;
    const platformArray = platform.split(',')
    const { sortBy } = req.query;  // get sort method
    if(platform === 'all'){
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
        res.json(flattened)
        return;
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
    }
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
        res.json(flattened)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.get('/api/collectibles', async(req, res) => {
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

app.get('/api/orders/content', authenticateToken, async (req, res) => {
    const userID = req.user.id;
    try {
        const order = await OrdersModel.findAll({
            where: {
                user_id: userID,
            },
            attributes: ['order_id','price', 'date_ord', 'user_id'],
        });
        res.json(order);
    } catch (err) {
        console.error('Error with sending cart items', err);
        return res.json({ success: false, message: 'Error with getting cart items' });
    }
});


app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});