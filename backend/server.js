let express = require('express');
let cors = require('cors');
let app = express();
let port = 4000;
const { sequelize } = require('./config/db');
const db = require('./models/index')(sequelize);
const OrdersModel = db.Order;
const OrderItemModel = db.OrderItem;
require('dotenv').config(); // Για να διαβάζει το .env
const gameRoutes = require('./routes/GameRoutes');
const collectibleRoutes = require('./routes/CollectibleRoutes');
const accessoryRoutes = require('./routes/AccessoryRoutes');
const cartRoutes = require('./routes/CartRoutes');
const productRoutes = require('./routes/ProductRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const authRoutes = require('./routes/AuthRoutes');
const { authenticateToken } = require('./middleware/auth');
app.use(cors());
app.use(express.json());

app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collectibles', collectibleRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/product', productRoutes);

// app for orders
app.post('/api/orders/new', async (req, res) => {
    
    const { items } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order must contain products.' });
    }    
    const totalAmount = items.reduce((total, item) => total + item.quantity * item.unit_price, 0);
    console.log(totalAmount)
    try {
      //temp values
        const newOrder = await OrdersModel.create({
            user_id: 1,
            total_amount: totalAmount,
            status: 'Pending', // Default status
            created_at: '2025-12-25',
        });

        
        const orderItems = items.map(item => ({
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        await OrderItemModel.bulkCreate(orderItems);

       

        // Return a response with the created order
        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            order_id: newOrder.order_id,
        });
    } catch (err) {
         console.error('Error creating the order:', err);
        res.status(500).json({ success: false, message: 'Failed to create order.' });
    }

});

app.get('/api/orders/content', authenticateToken, async (req, res) => {
    const userID = req.user.id;
    try {
        const order = await OrdersModel.findAll({
            where: {
                user_id: userID,
            }, include: {
                model: OrderItemsModel,
                attributes: ['product_id', 'quantity', 'unit_price'],
            },
            attributes: ['order_id', 'price', 'created_at', 'user_id'],
        });

        if (orders.length === 0) {
            return res.json({ success: false, message: 'No orders found for this user.' });
        }

        res.json(order);
    } catch (err) {
        console.error('Error with sending cart items', err);
        return res.json({ success: false, message: 'Error with getting cart items' });
    }
});


app.listen(port, () => {
    console.log('Server listening at http://localhost:' + port);
});