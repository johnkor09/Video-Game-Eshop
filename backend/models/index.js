module.exports = (sequelize) => {
    const User = require('./User')(sequelize);
    const Cart = require('./Cart')(sequelize);
    const CartItem = require('./CartItem')(sequelize);
    const Game = require('./Game')(sequelize);
    const Product = require('./Product')(sequelize);
    const Accessory = require('./Accessory')(sequelize);
    const Collectible = require('./Collectible')(sequelize);

    User.hasOne(Cart, {
        foreignKey: 'user_id',
        as: 'cart',
        onDelete: 'CASCADE'
    });

    Product.hasOne(Game, {
        foreignKey: 'product_id',
        as: 'gameDetails'
    });
    Product.hasOne(Accessory, {
        foreignKey: 'product_id',
        as: 'accessoryDetails'
    });
    Product.hasOne(Collectible, {
        foreignKey: 'product_id',
        as: 'collectibleDetails'
    });

    Game.belongsTo(Product, {
        foreignKey: 'product_id'
    });
    Accessory.belongsTo(Product, {
        foreignKey: 'product_id'
    });
    Collectible.belongsTo(Product, {
        foreignKey: 'product_id'
    });

    Cart.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    Cart.hasMany(CartItem, {
        foreignKey: 'cart_id',
        as: 'items',
        onDelete: 'CASCADE'
    });

    CartItem.belongsTo(Cart, {
        foreignKey: 'cart_id',
        as: 'cart'
    });

    Game.hasMany(CartItem, {
        foreignKey: 'product_id',
        as: 'cartItems'
    });
    Accessory.hasMany(CartItem, {
        foreignKey: 'product_id',
        as: 'cartItems'
    });
    Collectible.hasMany(CartItem, {
        foreignKey: 'product_id',
        as: 'cartItems'
    });

    CartItem.belongsTo(Product, {
        foreignKey: 'product_id',
        as: 'product'
    });



    return {
        User,
        Cart,
        CartItem,
        Game,
        Product,
        Accessory,
        Collectible
    };
};