import './Accessories.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductItemPanel from './ItemPanel.js';
import ComboBox from '../ComboBox.js';
export default function Home() {
    const navigate = useNavigate();
    const [accessories, setAccessories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('Recent');
    useEffect(() => {
        const getAccessories = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/accessories/all?sortBy=${sortBy}`);
                setAccessories(response.data);
            } catch (err) {
                console.error("Failed to get accessories data.", err);
                setError("Προβλημα με τον server!");
            } finally {
                setLoading(false);
            }
        };

        getAccessories();
    }, [sortBy]);
    if (loading) {
        return (
            <div className="home loading">
                <div className='Text'>Loading accessories list</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='home error'>
                <div className='Text error'>Κατι πηγε στραβα με την φορτωση των accessories! Error:{error}</div>
            </div>
        );
    }

    return (
        <div className="home">
            <h1 className="Accessory-title">All accessories</h1>
            
            {accessories.length === 0 ? (
                <div className="Text noaccessoriesMessage">No accessories found :(</div>
            ) : (

                    <div className="accessoriesGrid">
                        <ComboBox setSortBy={setSortBy} />
                        {accessories.map(Accessories => (
                        <ProductItemPanel product={Accessories} key={Accessories.product_id} />
                    ))}
                </div>
            )}

            <div className='Accessories-Type'>
                <h1 className='title-Controller' onClick={() => navigate('/accessories/Controller')}>Controllers</h1>

                {accessories.length === 0 ? (
                    <div className="Text noaccessoriesMessage">No accessories found :(</div>
                ) : (
                     <div className="accessoriesGrid">
                            {accessories.filter(Accessories => Accessories.accessory_type === "Controller" ).map(Accessories => (
                                <ProductItemPanel product={Accessories} key={Accessories.product_id} />
                            ))}
                    </div>
                )}
            </div>

            <div className='Accessories-Type'>
                <h1 className='title-VR' onClick={() => navigate('/accessories/VR')}>VR</h1>

                {accessories.length === 0 ? (
                    <div className="Text noaccessoriesMessage">No accessories found :(</div>
                ) : (
                     <div className="accessoriesGrid">
                            {accessories.filter(Accessories => Accessories.accessory_type === 'VR' ).map(Accessories => (
                                <ProductItemPanel product={Accessories} key={Accessories.product_id} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};