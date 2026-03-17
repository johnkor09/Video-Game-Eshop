import './AdminPanel.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaRegTrashCan } from "react-icons/fa6";


export default function AdminCustomers() {

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
        const url = 'http://localhost:4000/api/users';
        
        // 1. Πάρε το token
        const token = localStorage.getItem('userToken'); 

        // 2. Στείλε το στο header
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        setCustomers(response.data);

    } catch (err) {
        console.error("Failed to get customers data.", err);
        // Αν το error είναι 401, σημαίνει ότι το token έληξε ή δεν είσαι admin
        setError(err.response?.status === 401 ? "Δεν έχετε δικαιώματα πρόσβασης." : "Πρόβλημα με τον server.");
        setCustomers([]);
    } finally {
        setLoading(false);
    }
};
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredCustomers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredCustomers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="AdminPanel-loading">
                <div className='Text'>Loading customer list</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='AdminPanel error'>
                <div className='Text error'>Κατι πηγε στραβα με την φορτωση πελατών! Error:{error}</div>
            </div>
        );
    }
    return (
        <>
            <div className='Customers-grid'>
                <div className='Customers-panel'>
                    <div className='Customers-title'>Users</div>
                    <div className='AdminPanel-grid'>
                        <div className='Customers_-panel'>
                            <div className='Customers_-title'>Total Users</div>
                            {/* users */}
                            <div className='Customers-grid'>
                                <div className='UserTxt'>Users: {filteredCustomers.length}</div>
                            </div>

                        </div>
                        <div className='Customers_-panel'>
                            <input
                                type="text"
                                placeholder="Αναζήτηση με όνομα ή email..."
                                className="search-input"
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Επαναφορά στην 1η σελίδα κατά την αναζήτηση
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className='Customers-grid'>
                <div className='Customers-panel'>
                    <div className='Users-list'>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Όνομα</th>
                                    <th>Email</th>
                                    <th>Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(user => (
                                    <tr key={user.user_id}>
                                        <td>{user.user_id}</td>
                                        <td>{user.first_name} {user.surname}</td>
                                        <td> {user.email}</td>
                                        <td style={{ color: user.admin_status ? 'darkgreen' : 'darkred' }}>{user.admin_status ? "Yes" : "No"}</td>
                                        <td>
                                                <button className="button-info" ><FaRegTrashCan className="buttonicon" color={'red'} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='pagination'>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={currentPage === i + 1 ? "active" : ""}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}