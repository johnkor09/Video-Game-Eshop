module.exports = (sequelize) => { 
    const User = require('./User')(sequelize);
    const Cart = require('./Cart')(sequelize);
    const CartItem = require('./CartItem')(sequelize);
    const Product = require('./Product')(sequelize);

User.hasOne(Cart,{
    foreignKey:'user_id',
    as: 'cart',
    onDelete: 'CASCADE'
});

Cart.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Cart.hasMany(CartItem,{
    foreignKey: 'cart_id',
    as: 'items',
    onDelete: 'CASCADE'
});

CartItem.belongsTo(Cart, {
    foreignKey: 'cart_id',
    as: 'cart'
});

Product.hasMany(CartItem, {
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
        Product
    };
};