const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Για να διαβάζει το .env
const bcrypt = require('bcrypt');
const saltRounds = 10;
const UserModel = db.User;
const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';

exports.signup = async (req, res) => {
    const { name, surname, email, pass1 } = req.body;
    try {
        const existingUser = await UserModel.findOne({ where: { email: email } });

        if (existingUser) {
            return res.json({
                success: false,
                message: "Email already in use!"
            });
        }

        const hashedPassword = await bcrypt.hash(pass1, saltRounds);

        const newUser = await UserModel.create({
            password_: hashedPassword,
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

}

exports.login = async (req, res) => {
    //εδω τσεκαρει αν υπαρχει ο χρηστης με τα στοιχεια αυτα
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({
            where: {
                email: email
            }
        });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password_);

            if (isMatch) {
                const data = {
                    id: user.user_id,
                    name: user.first_name,
                    email: user.email,
                    role: user.admin_status
                };
                const token = jwt.sign(data, JWT_SECRET, { expiresIn: '2h' });

                return res.json({
                    success: true,
                    message: "Logged in successfully :)",
                    token: token,
                    user: data
                });
            }
        }
        //αν δεν βρει χρηστη
        return res.status(401).json({
            success: false,
            message: "Wrong email or password."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error');
    }
}