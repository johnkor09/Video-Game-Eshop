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
require('dotenv').config(); // Για να διαβάζει το .env

// αυτο ειναι το μυστικο κλειδι κρυπτογραφησης jwt και καποια στιγμη πρεπει να το βαλουμε σε .env αρχειο
const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';
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

app.get('/api/games', async (req, res) => {
    try {
        const games = await GameModel.findAll({
            where: {
                is_active: 1
            },
            attributes: ['game_id', 'title', 'price', 'platform', 'cover_image_url']
        });
        console.log("done");
        res.json(games)
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
            order: [ [sortField, sortOrder] ],
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
                platform: { [Op.in]: ['Playstation 5','Playstation 4'] }
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

app.get('/api/games/:platform/:gameId', async (req, res) => {
    const { platform, gameId } = req.params;
    try {
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

app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});