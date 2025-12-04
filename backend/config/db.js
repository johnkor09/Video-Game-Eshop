const { Sequelize, DataTypes } = require('sequelize');

let sequelize = new Sequelize('eshop', 'root', '', {
    host: "localhost",
    dialect: 'mysql',
    logging: false
});

sequelize.authenticate()
    .then(() => {
        console.log("connection created with mysql successfully");
    })
    .catch(err => {
        console.log("error occurred while connecting");
    });
module.exports = { sequelize, DataTypes };