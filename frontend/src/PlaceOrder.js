import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PlaceOrder() {
    let navigate = useNavigate();
    const [error, setError] = useState('');
    //temp values
    const [items, setItems] = useState([
        { product_id: 1, quantity: 2, unit_price: 10.99 },
        { product_id: 2, quantity: 1, unit_price: 15.50 },
    ]);

    const handleCheckout = async () => {
        setError('');
        try {
            const api_url = 'http://localhost:4000/api/orders/new';

            const response = await axios.post(api_url, { items }); 

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
        <div>
            <button onClick={handleCheckout}>Complete</button>
            {error && <div>{error}</div>}
        </div>
    );
}