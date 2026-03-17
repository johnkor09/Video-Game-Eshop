import React, { useState, useEffect } from 'react';
import { useAuth } from '../Authentication/AuthContext'; // Προσάρμοσε το path ανάλογα



export default function ProfileEdit() {
    const { user, token, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        surname: '',
        email: ''
    });

    

    // Γεμίζουμε τη φόρμα όταν φορτώσει ο χρήστης από το Context
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                surname: user.surname || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:4000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // ΕΝΗΜΕΡΩΣΗ ΤΟΥ UI
            updateUser({ name: formData.first_name, surname: formData.surname });
            alert("Το προφίλ ενημερώθηκε!");
        }
    } catch (error) {
        console.error(error);
    }
};

    return (
        <div className="profile-section">
            <h3>Ρυθμίσεις Προφίλ</h3>
            <form onSubmit={handleSubmit} className="account-form">
                <div className="form-group">
                    <label>Όνομα</label>
                    <input 
                        type="text" 
                        value={formData.first_name} 
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Επώνυμο</label>
                    <input 
                        type="text" 
                        value={formData.surname} 
                        onChange={(e) => setFormData({...formData, surname: e.target.value})} 
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email (Μη επεξεργάσιμο)</label>
                    <input type="email" value={formData.email} disabled className="disabled-input" />
                </div>
                <button type="submit" className="save-btn">Αποθήκευση</button>
            </form>
        </div>
    );
}