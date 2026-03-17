import React, { useEffect, useState } from 'react';
import { useAuth } from '../Authentication/AuthContext';

export default function OrderHistory() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/users/my-orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Orders fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchOrders();
    }, [token]);

    if (loading) return <p>Φόρτωση παραγγελιών...</p>;

    return (
        <div className="orders-section">
            <h3>Ιστορικό Παραγγελιών</h3>
            {orders.length === 0 ? (
                <p>Δεν έχετε πραγματοποιήσει παραγγελίες ακόμα.</p>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ημερομηνία</th>
                            <th>Ποσό</th>
                            <th>Κατάσταση</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.order_id}>
                                <td>#{order.order_id}</td>
                                <td>{new Date(order.created_at).toLocaleDateString('el-GR')}</td>
                                <td>{order.total_amount}€</td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}