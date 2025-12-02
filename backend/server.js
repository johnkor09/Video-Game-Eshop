let express = require('express');
let cors = require('cors');
let app = express();
let port = 5000;
let mysql = require('mysql');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Για να διαβάζει το .env

// αυτο ειναι το μυστικο κλειδι κρυπτογραφησης jwt και καποια στιγμη πρεπει να το βαλουμε σε .env αρχειο
const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    database: "eshop",
    user: "root",
    password: ""
});
//εδω κανω connect με mysql server δλδ πρωτη χειραψια και μενει ανοικτη η συνδεση μεχρι να την κλεισουμε
connection.connect(function (err) {
    if (err) {
        console.log("error occurred while connecting");
    } else {
        console.log("connection created with mysql successfully");
    }
});
app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
    //εδω τσεκαρει αν υπαρχει ο χρηστης με τα στοιχεια αυτα
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password_ = ?";
    connection.query(sql, [email, password], function (err, result) {
        if (err) {
            //error handling
            console.error(err);
            return res.status(500).send('Database error.');
        }
        if (result.length > 0) {
            const user = result[0]; // Παιρνουμε τον πρωτο χρηστη
            const data = {
                id: user.user_id,
                name: user.first_name,
                email: user.email,
                role: user.admin_status
            };

            // υπογραφη του token, δλδ φτιαχνει ενα κρυπτογραφημενο token 
            // μεσα εχει το id και το email του χρηστη
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
    });
});

app.post('/api/signup', (req, res) => {
    //εδω τσεκαρει αν υπαρχει ο χρηστης με τα στοιχεια αυτα
    const { name, surname, email, pass1 } = req.body;
    const sql1 = "SELECT * FROM users WHERE email = ?";
    connection.query(sql1, [email], function (err, result) {
        if (result.length > 0) {
            return res.json({
                success: false,
                message: "Email already in use!"
            });
        }
        if (err) {
            //error handling
            console.error(err);
            return res.status(500).send('Database error.');
        }
        if (result.length === 0) {
            const sql2 = "INSERT INTO users (password_,first_name,surname,email) VALUES(?,?,?,?)";
            connection.query(sql2, [pass1, name, surname, email], function (signup_error, signup_result) {
                if (signup_error) {
                    console.error(signup_error);
                    return res.status(500).send('Database error.');
                }
                const sql3 = "SELECT * FROM users WHERE email = ? AND password_ = ?";
                connection.query(sql3, [email, pass1], function (err, result) {
                    if (err) {
                        //error handling
                        console.error(err);
                        return res.status(500).send('Database error.');
                    }
                    if (result.length > 0) {
                        const user = result[0]; // Παιρνουμε τον πρωτο χρηστη
                        const data = {
                            id: user.user_id,
                            name: user.first_name,
                            email: user.email,
                            role: user.admin_status
                        };

                        // υπογραφη του token, δλδ φτιαχνει ενα κρυπτογραφημενο token 
                        // μεσα εχει το id και το email του χρηστη
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
                            message: "Sign-up error!!Don't panic o.O"
                        });
                    }
                });
            });
        }
    });
});

app.get('/api/games', (req, res) => {
    const sql = 'SELECT game_id, title, price, platform, cover_image_url FROM video_games WHERE is_active = 1';
    connection.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/api/games/:platform/:gameId', (req, res) => {
    const { platform, gameId } = req.params;
    const sql = 'SELECT * FROM video_games WHERE game_id = ? AND platform = ? AND is_active = 1';
    connection.query(sql, [gameId, platform], (err, results) => {
        if (err) throw err;
        if (results.length == 0) {
            return res.status(404).json({ message: 'Game not found.' });
        }
        res.json(results[0]);
    });
});

app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});