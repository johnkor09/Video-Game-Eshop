const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const OrderModel = db.Order;
const OrderItemModel = db.OrderItem;

exports.CreateOrder = async (req, res) => {
    const { user, BasketProducts: items } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order must contain products.' });
    }
    const totalAmount = items.reduce((total, item) => total + item.quantity * item.price_at_addition, 0);

    try {
        const newOrder = await OrderModel.create({
            user_id: user.id,
            total_amount: totalAmount,
            status: 'Pending', // Default status
        });

        const orderItems = items.map(item => ({
            order_id: newOrder.order_id,
            product_id: item.product_id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.price_at_addition * item.quantity
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
}

exports.GetOrder = async (req, res) => {
    const userID = req.user.id;
    try {
        const order = await OrderModel.findAll({
            where: {
                user_id: userID,
            }, include: {
                model: OrderItemModel,
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
}