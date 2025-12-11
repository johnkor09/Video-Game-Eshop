let express = require('express');
let cors = require('cors');
let app = express();
let port = 4000;
const { sequelize } = require('./config/db');
const UserModelDefinition = require('./models/User');
const UserModel = UserModelDefinition(sequelize);
const GameModelDefinition = require('./models/Game');
const GameModel = GameModelDefinition(sequelize);
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config(); // Για να διαβάζει το .env

// αυτο ειναι το μυστικο κλειδι κρυπτογραφησης jwt και καποια στιγμη πρεπει να το βαλουμε σε .env αρχειο
const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';

let sortField = 'game_id';
let sortOrder = 'DESC';
function Get_SortBy(sortBy) {
    if (sortBy === 'Low-High') {
        sortField = 'price';
        sortOrder = 'ASC'; //ascending
    } else if (sortBy === 'High-Low') {
        sortField = 'price';
        sortOrder = 'DESC';//descending
    } else if (sortBy === 'Recent') {
        sortField = 'game_id';
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
        // 1. Βρείτε την εγγραφή για να πάρετε το URL της εικόνας
        const gameToDelete = await GameModel.findOne({
            where: { game_id: gameId },
            attributes: ['cover_image_url']
        });

        if (!gameToDelete) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        const imageUrl = gameToDelete.cover_image_url;

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
        const deletedCount = await GameModel.destroy({
            where: { game_id: gameId }
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
    let finalImageUrl = null;

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

    try {
        const newGame = await GameModel.create({
            title: game.title,
            price: game.price,
            stock_quantity: game.stock_quantity,
            release_date: game.release_date ? new Date(game.release_date) : null,
            developer: game.developer,
            publisher: game.publisher,
            genres: game.genres,
            platform: game.platform,
            description_: game.description_,
            cover_image_url: finalImageUrl
        });

        return res.status(201).json({
            message: 'Το παιχνίδι δημιουργήθηκε επιτυχώς.',
            game: newGame
        });
    } catch (err) {
        console.error("Create Error:", err);
        return res.status(500).json({ message: 'Database error during creation.' });
    }
});

app.put('/api/games/:gameId', checkAuthAndAdmin, async (req, res) => {
    const gameId = req.params.gameId;
    const game = req.body;
    const imageFile = req.files ? req.files.coverImage : null;
    let gameData = {
        title: game.title,
        price: game.price,
        stock_quantity: game.stock_quantity,
        release_date: game.release_date ? new Date(game.release_date) : null,
        developer: game.developer,
        publisher: game.publisher,
        genres: game.genres,
        platform: game.platform,
        description_: game.description_
    }
    try {
        if (imageFile) {
            const titleSlug = gameData.title.trim()
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .toLowerCase();
            const platformSlug = gameData.platform.trim()
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .toLowerCase();
            const fileExtension = path.extname(imageFile.name);
            const fileName = `${titleSlug}_${platformSlug}${fileExtension}`;
            const uploadPath = path.join(UPLOAD_DIR, fileName);

            try {
                // Αποθήκευση του αρχείου στον δίσκο
                await imageFile.mv(uploadPath);
                gameData.cover_image_url = fileName; // Αποθηκεύουμε μόνο το όνομα/path στη DB
                console.log(`Το αρχείο αποθηκεύτηκε ως: ${fileName}`);
            } catch (err) {
                console.error("File upload error:", err);
                return res.status(500).json({ message: 'Αποτυχία αποθήκευσης αρχείου στον δίσκο.' });
            }

        }
        const game = await GameModel.findOne({ where: { game_id: gameId } });

        const [updatedRows] = await GameModel.update(
            gameData
            ,
            { where: { game_id: gameId } }
        );
        if (updatedRows > 0) {
            const updatedGame = await GameModel.findByPk(gameId);
            return res.json({ success: true, message: 'Game updated successfully.', game: updatedGame });
        } else {
            return res.status(404).json({ success: false, message: 'Game not found or no changes were made.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error during update.' });
    }

});

app.get('/api/games', async (req, res) => {
    const { sortBy } = req.query;  // get sort method
    try {
        Get_SortBy(sortBy);
        const games = await GameModel.findAll({
            where: {
                is_active: 1
            },
            attributes: ['game_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(games)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.get('/api/games/:platform/:gameId', async (req, res) => {
    const { platform, gameId } = req.params;
    try {
        Get_SortBy(sortBy);
        const game = await GameModel.findOne({
            where: {
                platform: platform,
                game_id: gameId
            },
            attributes: ['game_id', 'title', 'price', 'stock_quantity', 'release_date'
                , 'developer', 'publisher', 'genres', 'platform', 'description_', 'cover_image_url', 'is_active']
        });
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }
        res.json(game);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.get('/api/games/nintendo', async (req, res) => {
    const { sortBy } = req.query;  // get sort method
    try {
        Get_SortBy(sortBy);
        const games = await GameModel.findAll({
            where: {
                is_active: 1,
                platform: { [Op.in]: ['Nintendo Switch 2', 'Nintendo Switch'] }
            },
            attributes: ['game_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(games)
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
        const games = await GameModel.findAll({
            where: {
                is_active: 1,
                platform: { [Op.in]: ['Playstation 5', 'Playstation 4'] }
            },
            attributes: ['game_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(games)
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
        const games = await GameModel.findAll({
            where: {
                is_active: 1,
                platform: 'Xbox Series'
            },
            attributes: ['game_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(games)
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
        const games = await GameModel.findAll({
            where: {
                is_active: 1,
                platform: 'PC'
            },
            attributes: ['game_id', 'title', 'price', 'platform', 'cover_image_url'],
            order: [[sortField, sortOrder]],
        });
        res.json(games)
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});



app.get('/api/games/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        const game = await GameModel.findOne({
            where: {
                game_id: gameId
            },
            attributes: ['game_id', 'title', 'price', 'stock_quantity', 'release_date'
                , 'developer', 'publisher', 'genres', 'platform', 'description_', 'cover_image_url', 'is_active']
        });
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }
        res.json(game);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
});

app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});