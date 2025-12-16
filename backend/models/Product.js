const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        stock_quantity:{ 
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        release_date: DataTypes.DATE,
        developer: DataTypes.STRING,
        publisher: DataTypes.STRING,
        genres: DataTypes.STRING,
        platform: DataTypes.STRING,
        description_: DataTypes.STRING,
        cover_image_url: DataTypes.STRING,
        category: {
            type: DataTypes.ENUM('Game', 'Collectible', 'Accessory'),
            allowNull: false,
            defaultValue: 'Game'
        },
        is_active: DataTypes.BOOLEAN,
        date_added: DataTypes.DATE
    }, {
        tableName: 'products',
        timestamps: false
    });
    return Product;
};