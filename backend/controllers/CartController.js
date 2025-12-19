const { sequelize } = require('../config/db');
const db = require('../models/index')(sequelize);
const ProductModel = db.Product;
const CartModel = db.Cart;
const CartItemModel = db.CartItem;


exports.RemoveCartItem = async(req,res) =>{
    const itemId = req.body.itemId;
    const userId = req.user.id;
    const parseditemId = parseInt(itemId);
    if (!parseditemId || parseditemId <= 0) {
        return res.status(400).json({ message: 'Μη έγκυρο Cart item ID.' });
    }

    try {
        const cart = await CartModel.findOne({
            where: { user_id: userId },
            attributes: ['cart_id']
        });

        if (!cart) {
            return res.status(400).json({ message: 'Δεν βρεθηκε το cart για τον χρηστη ' + userId });
        }
        const cartId = cart.cart_id;

        const deletedCount = await CartItemModel.destroy({
            where: {
                item_id: parseditemId,
                cart_id: cartId
            }
        });
        if (deletedCount > 0) {
            return res.status(200).json({ message: 'Item in cart removed successfully.' });
        } else {
            return res.status(400).json({ message: 'Cart item not found.' });
        }
    } catch (err) {
        console.error("Item removal Error:", err);
        return res.status(500).json({ message: 'Database error during removal.' });
    }
}

exports.ChangeQuantity = async(req,res) =>{
    const userId = req.user.id;
    const itemId = req.body.itemId;
    const quantity = req.body.NewQuantity
    const parsedItemId = parseInt(itemId);
    const newQuantity = parseInt(quantity);

    if (!parsedItemId || parsedItemId <= 0 || !newQuantity || newQuantity <= 0) {
        return res.status(400).json({ message: 'invalid item id or invalid quantity' });
    }
    try {
        const cart = await CartModel.findOne({
            where: { user_id: userId }
        });

        if (!cart) {
            return res.status(400).json({ message: 'no cart found for user ' + userId });
        }
        const cart_id = cart.cart_id;

        const cartItem = await CartItemModel.findOne({
            where: { item_id: parsedItemId, cart_id: cart_id },
            include: [{
                model: ProductModel,
                as: 'product' // Σύνδεση με Product για το stock
            }]
        });

        const availableStock = cartItem.product.stock_quantity;

        if (newQuantity > availableStock) {
            return res.status(400).json({
                message: 'Not available Stock. Max stock: ' + availableStock,
                maxQuantity: availableStock
            });
        }

        await cartItem.update({ quantity: newQuantity });

        return res.status(200).json({
            message: 'Quantity updated succesfully to ' + newQuantity,
            cartItem: cartItem
        });
    } catch (err) {
        console.error("Cart Update Error:", err);
        return res.status(500).json({ message: 'Quantity update issue' });
    }
}

exports.AddItemToCart = async(req,res) =>{
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const parsedproductId = parseInt(productId);
    const parsedQuantity = parseInt(quantity);

    if (!parsedproductId || isNaN(parsedproductId) || parsedQuantity < 1 || isNaN(parsedQuantity)) {
        return res.status(400).json({ message: 'Μη έγκυρο Game ID ή Ποσότητα.' });
    }

    try {
        const product = await ProductModel.findByPk(parsedproductId);

        if (!product || product.is_active === 0) {
            return res.status(400).json({ message: 'Product not found or unavailable!' });
        }

        if (product.stock_quantity < parsedQuantity) {
            return res.status(400).json({ message: 'No stock available' });
        }

        const [cart] = await CartModel.findOrCreate({ where: { user_id: userId } });

        const [cartItem, itemCreated] = await CartItemModel.findOrCreate({
            where: {
                cart_id: cart.cart_id,
                product_id: parsedproductId
            },
            defaults: {
                cart_id: cart.cart_id,
                product_id: parsedproductId,
                quantity: parsedQuantity,
                price_at_addition: product.price
            }
        });

        if (!itemCreated) {
            const totalRequestedQuantity = cartItem.quantity + parsedQuantity;

            if (product.stock_quantity < totalRequestedQuantity) {
                return res.status(400).json({ message: 'No more stock available' });
            }

            await cartItem.update({ quantity: totalRequestedQuantity });

            return res.status(200).json({
                message: 'Quantity of item was updated to ' + totalRequestedQuantity,
                cartItem: cartItem
            });
        }

        return res.status(201).json({
            message: 'Item added to cart.',
            cartItem: cartItem
        });
    } catch (err) {
        console.error('Cart error', err);
        return res.status(500).json({ message: 'Error adding item to cart!' });
    }
}

exports.CartContent=async(req,res)=>{
    const userId = req.user.id;
    try {
        const [cart] = await CartModel.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId }
        });

        const cartItemsList = await CartItemModel.findAll({
            where: { cart_id: cart.cart_id },
            include: [{
                model: ProductModel,
                as: 'product',
                attributes: ['product_id', 'title', 'price', 'cover_image_url', 'stock_quantity', 'product_type'],
            }],
            order: [['item_id', 'ASC']]
        });

        if (cartItemsList.length > 0) {
            const response = cartItemsList.map(item => ({
                item_id: item.item_id,
                quantity: item.quantity,
                price_at_addition: item.price_at_addition,
                product_id: item.product.product_id,
                title: item.product.title,
                cover_image_url: item.product.cover_image_url,
                stock_quantity: item.product.stock_quantity,
                product_type: item.product.product_type
            }));
            return res.status(200).json(response);
        }
        else {
            return res.status(200).json([]);
        }
    } catch (err) {
        console.error('Error with sending cart items', err);
        return res.json({ success: false, message: 'Error with getting cart items' });
    }
}