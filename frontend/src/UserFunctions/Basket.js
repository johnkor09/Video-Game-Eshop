import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import './Basket.css'
import { useEffect } from 'react';
import { FaRegTrashCan } from "react-icons/fa6";
import { IoBagCheckOutline } from "react-icons/io5";

export default function Basket() {
    const { user, token } = useAuth();
    const [BasketGames, setBasketGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getBasketGames = async () => {
            if (!user || !token) {
                setError("Log in first.");
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
                setBasketGames(response.data);
            } catch (err) {
                console.error("Failed to get games data.", err);
                setError("Cant load cart items.");
            } finally {
                setLoading(false);
            }
        };

        getBasketGames();
    }, [user, token]);

    if (loading) {
        return <div className="loading">Φόρτωση καλαθιού...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }
    const calculateTotal = () => {
        return BasketGames.reduce((acc, item) => {
            return acc + (parseFloat(item.price_at_addition) * item.quantity);
        }, 0).toFixed(2);
    };


    return (
        <div className='BasketPage'>
            <div className='Basket-Panel'>
                <div className='Basket-Game-Grid'>
                    {BasketGames.length === 0 ?
                        (
                            <div>No Items in Cart</div>
                        ) :
                        (
                            BasketGames?.map(item => (
                                <div key={item.item_id} className='Basket-Item'>
                                    <img
                                        src={'/game_images/' + item.game.cover_image_url || './game_images/placeholder.jpg'}
                                        alt={'Cover for' + item.game.title}
                                        className='Basket-Item-coverImage'
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/444444/ffffff?text=Image+Missing'; }}
                                    />
                                    <div className='Basket-Item-Details'>
                                        <div className='Basket-Item-Details-Info'>{item.game.title} ({item.game.platform})</div>
                                        <p>Price for one: €{parseFloat(item.price_at_addition).toFixed(2)}</p>
                                        <p>Quantity:
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                min="1"
                                                className='quantity-input'
                                            />
                                        </p>
                                        <p className='total-price'>
                                            Total price: €{(parseFloat(item.price_at_addition) * item.quantity).toFixed(2)}
                                        </p>
                                        <FaRegTrashCan className='Basket-remove-button'/>
                                    </div>
                                </div>
                            ))
                        )
                    }
                </div>
                <div className='Basket-Functions-Grid'>
                    <div className='Total-Text'>Total:</div>
                    <p className='grand-total'>Cart total price: €{calculateTotal()}</p>
                    <button className='checkout-button'><IoBagCheckOutline color='greenyellow' className='Checkout-icon'/><div>Checkout</div></button>
                </div>
            </div>
        </div>
    );

}