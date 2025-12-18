let express = require('express');
let cors = require('cors');
let app = express();
let port = 4000;
const { sequelize } = require('./config/db');
const db = require('./models/index')(sequelize);
const UserModel = db.User;
const ProductModel = db.Product;
const CartModel = db.Cart;
const CartItemModel = db.CartItem;
const OrdersModel = db.Orders;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const fileUpload = require('express-fileupload');
const path = require('path');
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
    const productId = req.params.gameId;

    try {
        // 1. Βρείτε την εγγραφή για να πάρετε το URL της εικόνας
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
                console.log(`Εικόνα διαγράφηκε επιτυχώς: ${imagePath}`);
            } catch (fsError) {
                if (fsError.code === 'ENOENT') {
                    console.warn(`Προσοχή: Το αρχείο εικόνας ${imagePath} δεν βρέθηκε στον δίσκο.`);
                } else {
                    console.error("Σφάλμα διαγραφής αρχείου:", fsError);
                }
            }
        }

        // Η εντολή destroy διαγράφει την εγγραφή
        const deletedCount = await ProductModel.destroy({
            where: { product_id: productId }
        });

        if (deletedCount > 0) {
            return res.json({ success: true, message: 'Product deleted successfully.' });
        } else {
            return res.status(404).json({ message: 'Product not found.' });
        }
    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ message: 'Database error during deletion.' });
    }
});

app.post('/api/games/upload', checkAuthAndAdmin, async (req, res) => {
    const product = req.body;
    const imageFile = req.files ? req.files.coverImage : null;
    let finalImageUrl = null;

    if (imageFile) {
        const titleSlug = product.title.trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();
        const platformSlug = product.platform.trim()
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

    try {
        const newProduct = await ProductModel.create({
            title: product.title,
            price: product.price,
            stock_quantity: product.stock_quantity,
            release_date: product.release_date ? new Date(product.release_date) : null,
            developer: product.developer,
            publisher: product.publisher,
            genres: product.genres,
            platform: product.platform,
            description_: product.description_,
            cover_image_url: finalImageUrl,
            category: product.category
        });

        return res.status(201).json({
            message: 'Το προϊόν δημιουργήθηκε επιτυχώς.',
            game: newProduct
        });
    } catch (err) {
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
            where: { item_id: parsedItemId, cart_id: cart.cart_id },
            include: [{ model: ProductModel, as: 'product', attributes: ['stock_quantity'] }]
        });

        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

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
    const parsedProductId = parseInt(productId);
    const parsedQuantity = parseInt(quantity);

    if (!parsedProductId || isNaN(parsedProductId) || parsedQuantity < 1 || isNaN(parsedQuantity)) {
        return res.status(400).json({ message: 'Μη έγκυρο Product ID ή Ποσότητα.' });
    }

    try {
        const product = await ProductModel.findByPk(parsedProductId);

        if (!product || product.is_active === 0) {
            return res.status(400).json({ message: 'Product not found or unavailable!' });
        }
        if (product.stock_quantity < parsedQuantity) {
            return res.status(400).json({ message: 'No stock available' });
        }

        const productPrice = product.price;
        const [cart, created] = await CartModel.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId }
        });

        const cartId = cart.cart_id;
        const [cartItem, itemCreated] = await CartItemModel.findOrCreate({
            where: { cart_id: cartId, product_id: parsedProductId },
            defaults: {
                cart_id: cartId,
                product_id: parsedProductId,
                quantity: parsedQuantity,
                price_at_addition: productPrice
            }
        });

        if (!itemCreated) {
            const newQuantity = cartItem.quantity + parsedQuantity;

            if (product.stock_quantity < newQuantity) {
                return res.status(400).json({ message: 'No stock available' });
            }

            await cartItem.update({
                quantity: newQuantity
            });

            return res.status(200).json({
                message: 'Quantity of item was updated to ' + newQuantity,
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
        const [cart, created] = await CartModel.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId }
        });

        const cartId = cart.cart_id;
        const cartItemsList = await CartItemModel.findAll({
            where: { cart_id: cartId },
            include: [{
                model: ProductModel,
                as: 'product',
                attributes: ['title', 'platform', 'cover_image_url', 'stock_quantity', 'product_id', 'category']
            }],
            // sort
            order: [['item_id', 'ASC']]
        });

        if (cartItemsList.length > 0) {
            return res.status(200).json(cartItemsList);
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
    const productId = req.params.gameId;
    const product = req.body;
    const imageFile = req.files ? req.files.coverImage : null;
    
    let productData = {
        title: product.title,
        price: product.price,
        stock_quantity: product.stock_quantity,
        release_date: product.release_date ? new Date(product.release_date) : null,
        developer: product.developer,
        publisher: product.publisher,
        genres: product.genres,
        platform: product.platform,
        description_: product.description_,
        category: product.category
    }
    try {
        if (imageFile) {
            const titleSlug = productData.title.trim()
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .toLowerCase();
            const platformSlug = productData.platform.trim()
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .toLowerCase();
            const fileExtension = path.extname(imageFile.name);
            const fileName = `${titleSlug}_${platformSlug}${fileExtension}`;
            const uploadPath = path.join(UPLOAD_DIR, fileName);

            try {
                // Αποθήκευση του αρχείου στον δίσκο
                await imageFile.mv(uploadPath);
                productData.cover_image_url = fileName; // Αποθηκεύουμε μόνο το όνομα/path στη DB
                console.log(`Το αρχείο αποθηκεύτηκε ως: ${fileName}`);
            } catch (err) {
                console.error("File upload error:", err);
                return res.status(500).json({ message: 'Αποτυχία αποθήκευσης αρχείου στον δίσκο.' });
            }

        }

        const [updatedRows] = await ProductModel.update(
            productData
            ,
            { where: { product_id: productId } }
        );
        if (updatedRows > 0) {
            const updatedProduct = await ProductModel.findByPk(productId);
            return res.json({ success: true, message: 'Product updated successfully.', product: updatedProduct });
        } else {
            return res.status(404).json({ success: false, message: 'Product not found or no changes were made.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error during update.' });
    }

});

app.get('/api/games', async (req, res) => {
    const { sortBy, category } = req.query;  // get sort method
    try {
        Get_SortBy(sortBy);

        let categoryStatus = { is_active: 1 };  //Βρισκουμε το είδος
        
        // Κραταμε κατηγορία
        if (category) {
            categoryStatus.category = category;
        }

        const products = await ProductModel.findAll({
            where: categoryStatus,
            attributes: ['product_id', 'title', 'price', 'platform', 'cover_image_url', 'category'],
            order: [[sortField, sortOrder]],
        });
        res.json(products)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.get('/api/games/:platform/:productId', async (req, res) => {
    const { platform, productId } = req.params;
    const { sortBy } = req.query;
    try {
        Get_SortBy(sortBy);
        const product = await ProductModel.findOne({
            where: {
                platform: platform,
                product_id: productId
            },
            attributes: ['product_id', 'title', 'price', 'stock_quantity', 'release_date'
                , 'developer', 'publisher', 'genres', 'platform', 'description_', 'cover_image_url', 'is_active', 'category']
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.get('/api/games/nintendo', async (req, res) => {
    const { sortBy } = req.query;  // get sort method
    try {
        Get_SortBy(sortBy);
        const products = await ProductModel.findAll({
            where: {
                is_active: 1,
                platform: { [Op.in]: ['Nintendo Switch 2', 'Nintendo Switch'] },
                category: 'Game'
            },
            attributes: ['product_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(products)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.get('/api/games/playstation', async (req, res) => {
    const { sortBy } = req.query;  // get sort method
    try {
        Get_SortBy(sortBy);
        console.log('Received sortBy:', sortBy);
        const products = await ProductModel.findAll({
            where: {
                is_active: 1,
                platform: { [Op.in]: ['Playstation 5', 'Playstation 4'] },
                category: 'Game'
            },
            attributes: ['product_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(products)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});


app.get('/api/games/xbox', async (req, res) => {
    const { sortBy } = req.query;  // get sort method
    try {
        Get_SortBy(sortBy);
        console.log('Received sortBy:', sortBy);
        const products = await ProductModel.findAll({
            where: {
                is_active: 1,
                platform: 'Xbox Series',
                category: 'Game'
            },
            attributes: ['product_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(products)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.get('/api/games/pc', async (req, res) => {
    const { sortBy } = req.query;  // get sort method
    try {
        Get_SortBy(sortBy);
        console.log('Received sortBy:', sortBy);
        const products = await ProductModel.findAll({
            where: {
                is_active: 1,
                platform: 'PC',
                category: 'Game'
            },
            attributes: ['product_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(products)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});



app.get('/api/games/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        const product = await ProductModel.findOne({
            where: {
                product_id: gameId
            },
            attributes: ['product_id', 'title', 'price', 'stock_quantity', 'release_date'
                , 'developer', 'publisher', 'genres', 'platform', 'description_', 'cover_image_url', 'is_active', 'category']
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});