import React, { useState } from 'react';
import './AccountCenter.css';
import ProfileEdit from './ProfileEdit';
import OrderHistory from './OrderHistory';

export default function AccountCenter() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="account-container">
            <aside className="account-sidebar">
                <h2>Ο Λογαριασμός μου</h2>
                <button 
                    className={activeTab === 'profile' ? 'active' : ''} 
                    onClick={() => setActiveTab('profile')}
                >
                    Στοιχεία Προφίλ
                </button>
                <button 
                    className={activeTab === 'orders' ? 'active' : ''} 
                    onClick={() => setActiveTab('orders')}
                >
                    Παραγγελίες
                </button>
            </aside>

            <main className="account-content">
                {activeTab === 'profile' ? <ProfileEdit /> : <OrderHistory />}
            </main>
        </div>
    );
}