const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const UserModel = db.User;

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
}