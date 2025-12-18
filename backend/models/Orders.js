const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Orders = sequelize.define('Orders', {
        order_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        date_ord: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'Orders',
        timestamps: false,
    });
    return Orders;
};