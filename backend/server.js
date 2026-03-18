let express = require('express');
let cors = require('cors');
let app = express();
const { sequelize } = require('./config/db');
const db = require('./models/index')(sequelize);
require('dotenv').config(); // Για να διαβάζει το .env
const gameRoutes = require('./routes/GameRoutes');
const collectibleRoutes = require('./routes/CollectibleRoutes');
const accessoryRoutes = require('./routes/AccessoryRoutes');
const cartRoutes = require('./routes/CartRoutes');
const productRoutes = require('./routes/ProductRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const authRoutes = require('./routes/AuthRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticateToken } = require('./middleware/auth');
const OrdersRoute = require('./routes/OrderRoute');
app.use(cors());
app.use(express.json());

app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collectibles', collectibleRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/product', productRoutes);
app.use('/api/orders', OrdersRoute);


if (process.env.NODE_ENV !== 'test') {
    app.listen(4000, () => console.log('Server running on 4000'));
}

module.exports = app;