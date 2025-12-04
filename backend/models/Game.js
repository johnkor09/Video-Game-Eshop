const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Game = sequelize.define('Game', {
        game_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        
        price: {
            type: DataTypes.DECIMAL,
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
        is_active: DataTypes.BOOLEAN,
        date_added: DataTypes.DATE
    }, {
        tableName: 'video_games',
        timestamps: false
    });
    return Game;
};