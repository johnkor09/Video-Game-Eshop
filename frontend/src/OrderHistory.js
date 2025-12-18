import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './Authentication/AuthContext';

export default function OrderHistory() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [Orders, setOrders] = useState([]);
 
        const getOrders = useCallback(async () => {
            if (!user || !token) {
                setError("Log in first to view your orders.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:4000/api/orders/content',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setOrders(response.data);
            } catch (err) {
                console.error("Failed to get orders data.", err);
                setError("Problem with server!");
            } finally {
                setLoading(false);
            }
        }, [user, token]);

    useEffect(() => {
        getOrders();
    }, [getOrders]);


    if (loading) {
        return (
            <div className="home loading">
                <div className='Text'>Loading game list</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='home error'>
                <div className='Text error'>Something went wrong loading orders! Error:{error}</div>
            </div>
        );
    }

    return (
        <div>
        wow
        </div>
    );
};