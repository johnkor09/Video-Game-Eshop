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

app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});