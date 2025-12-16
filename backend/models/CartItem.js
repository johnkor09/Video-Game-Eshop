const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CartItem = sequelize.define('CartItem', {
        item_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate:{
                min: 1
            }
        },
        price_at_addition: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        }
    }, {
        tableName: 'cart_items',
        timestamps: false,
        indexes: [{
            name: 'unique_product_in_cart',
            unique: true,
            fields: ['cart_id', 'product_id']
        }]
    });
    return CartItem;
};