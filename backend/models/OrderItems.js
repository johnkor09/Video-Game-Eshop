const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OrderItems = sequelize.define('Order_items', {
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'Order_items',
        timestamps: false,
    });
    return OrderItems;
};