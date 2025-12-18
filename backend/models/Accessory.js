const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Accessory = sequelize.define('Accessory', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'products', key: 'product_id' }
        },
        brand: DataTypes.STRING,
        accessory_type: DataTypes.STRING
    }, {
        tableName: 'accessories',
        timestamps: false
    });
    return Accessory;
};