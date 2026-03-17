const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const UserModel = db.User;
const OrderModel = db.Order;

exports.GetAllCustomers = async (req, res) => {
        try {
            const customers = await UserModel.findAll({
                attributes: ['user_id', 'first_name', 'surname', 'email', 'admin_status'],
            });

            const flattened = customers.map(c => ({
                user_id: c.user_id,
                first_name: c.first_name,
                surname: c.surname,
                email: c.email,
                admin_status: c.admin_status
            }));
            return res.json(flattened);
            
        } catch (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }
};

exports.GetUserProfile = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.user.id, {
            attributes: ['user_id', 'first_name', 'surname', 'email', 'admin_status', 'registration_date']
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error.');
    }
};

exports.GetUserOrders = async (req, res) => {
    try {
        
        const currentUserId = req.user.id

       
        const orders = await OrderModel.findAll({
            where: { user_id: currentUserId },
            order: [['created_at', 'DESC']]
        });

        return res.json(orders);
    } catch (err) {
        console.error("DETAILED ERROR:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.UpdateUserProfile = async (req, res) => {
    const { first_name, surname } = req.body;
    try {
        // Χρησιμοποιούμε req.user.id γιατί έτσι το ονομάσαμε στο Login payload
        const userId = req.user.id; 

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }

        const [updatedRows] = await UserModel.update(
            { first_name, surname },
            { where: { user_id: userId } } // Εδώ το user_id είναι το όνομα της στήλης στη DB
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: "User not found or no changes made" });
        }

        return res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
};