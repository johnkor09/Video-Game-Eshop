import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import './Basket.css'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegTrashCan } from "react-icons/fa6";
import { IoBagCheckOutline } from "react-icons/io5";

export default function Basket() {
    const { user, token } = useAuth();
    const [BasketProducts, setBasketProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [Checkout, setCheckout] = useState(false);

    const getBasketProducts = useCallback(async () => {
        if (!user || !token) {
            setError("Log in first to view your cart.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:4000/api/cart/content',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (Array.isArray(response.data)) {
            setBasketProducts(response.data);
            console.log(response.data);
        } else {
            setBasketProducts(response.data.items || []);
        }
        } catch (err) {
            console.error("Failed to get games data.", err);
            setError("Cant load cart items.");
        } finally {
            setLoading(false);
        }
    }, [user, token]);

    useEffect(() => {
        getBasketProducts();
    }, [getBasketProducts]);



    if (loading) {
        return <div className="loading">Φόρτωση καλαθιού...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }
    const calculateTotal = () => {
        return BasketProducts.reduce((acc, item) => {
            return acc + (parseFloat(item.price_at_addition) * item.quantity);
        }, 0).toFixed(2);
    };

    const handleItemRemoval = async (itemId) => {
        if (!token) {
            return;
        }
        try {
            // eslint-disable-next-line
            const response = await axios.delete('http://localhost:4000/api/cart/removeItem',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: { itemId: itemId }
                });
            await getBasketProducts();
        } catch (err) {
            const message = err.response?.data?.message || "Αποτυχία διαγραφής αντικειμένου.";
            console.error("Failed to remove cart item.", err);
            alert('Σφάλμα: ' + message);
        }
    };

    const handleChangeQuantity = async (itemId, value) => {
        if (!token) {
            return;
        }
        const newQuantity = parseInt(value, 10);
        if (newQuantity < 1 || isNaN(newQuantity)) return;

        setBasketProducts(prevGames =>
            prevGames.map(item =>
                item.item_id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );

        try {
            // eslint-disable-next-line
            const response = await axios.put('http://localhost:4000/api/cart/changeQuantity',
                { itemId: itemId, NewQuantity: newQuantity },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
        } catch (err) {
            const message = err.response?.data?.message || "Αποτυχία αλλαγης quantity.";
            console.error("Failed to change cart item quantity.", err);
            alert('Σφάλμα: ' + message);
            await getBasketProducts();
        }
    };
    const handleCheckout = async () => {
        setError('');
        try {
            const api_url = 'http://localhost:4000/api/orders/new';

            const response = await axios.post(api_url, { user,BasketProducts });

            if (response.data.success) {
                console.log('Order placed successfully');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Unable to communicate with the server.');
        }
    };

    return (
        <div className='BasketPage'>
            <div className='Basket-Panel'>
                <div className='Basket-Game-Grid'>
                    {BasketProducts.length === 0 ?
                        (<div className='Empty-cart-text'>Looks like your cart is empty...</div>
                        ) :
                        (
                            BasketProducts?.map(item => (
                                <div key={item.item_id} className='Basket-Item' >
                                    <Link to={'/'+item.product_type+'/' + item.product_id}  >
                                        <img
                                            src={'/product_images/' + item.cover_image_url || './product_images/placeholder.jpg'}
                                            alt={'Cover for' + item.title}
                                            className='Basket-Item-coverImage'
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/444444/ffffff?text=Image+Missing'; }}
                                        />
                                    </Link>
                                    <div className='Basket-Item-Details'>
                                        <Link to={'/Games/' + item.platform + '/' + item.product_id}  >
                                            <div className='Basket-Item-Details-Info'>{item.title} ({item.platform})</div>
                                        </Link>
                                        <div className='basket-quantity'>Quantity:
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                min="1"
                                                className='quantity-input'
                                                onChange={(e) => handleChangeQuantity(item.item_id, e.target.value)}
                                            />
                                            <FaRegTrashCan onClick={() => handleItemRemoval(item.item_id)} className='Basket-remove-button' />
                                        </div>
                                        <div className='total-price'>
                                            <div >
                                                Total price:
                                            </div>
                                            <div className='total-price-price'>€{(parseFloat(item.price_at_addition) * item.quantity).toFixed(2)}</div>
                                        </div>

                                    </div>
                                </div>
                            ))
                        )
                    }
                </div>
                <div className='Basket-Functions-Grid'>
                    <div className='Total-Text'>Total:</div>
                    <p className='grand-total'>Cart total price: €{calculateTotal()}</p>
                    <button className='checkout-button' disabled={BasketProducts.length === 0} onClick={() => setCheckout(true)}><IoBagCheckOutline color='greenyellow' className='Checkout-icon' /><div>Checkout</div></button>
                    {Checkout && (
                        <div className="Pop-up">
                            <h2 className="Pop-header">Complete purchase?</h2>
                            <div className="Pop-buttons">
                                <button onClick={handleCheckout}>Complete</button>
                                {error && <div>{error}</div>}
                                <button onClick={() => setCheckout(false)}>Close</button>
                            </div>
                        </div>)}
                </div>
            </div>
        </div>
    );

}