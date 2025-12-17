const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
        product_type: { 
            type: DataTypes.ENUM('game', 'accessory', 'collectible'), 
            allowNull: false 
        },
        description_: DataTypes.TEXT,
        cover_image_url: DataTypes.STRING,
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        tableName: 'products',
        timestamps: false
    });
    return Product;
};