const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Game = sequelize.define('Game', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'products', key: 'product_id' }
        },
        developer: DataTypes.STRING,
        publisher: DataTypes.STRING,
        genres: DataTypes.STRING,
        platform: { type: DataTypes.STRING, allowNull: false },
        release_date: DataTypes.DATEONLY
    }, {
        tableName: 'video_games',
        timestamps: false
    });
    return Game;
};