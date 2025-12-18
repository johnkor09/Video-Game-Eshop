const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Collectible = sequelize.define('Collectible', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'products', key: 'product_id' }
        },
        brand: DataTypes.STRING,
        collectible_type: DataTypes.STRING
    }, {
        tableName: 'collectibles',
        timestamps: false
    });
    return Collectible;
};