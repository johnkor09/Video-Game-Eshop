import './Collectibles.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductItemPanel from './ItemPanel.js';
import ComboBox from '../ComboBox.js';
export default function Home() {
    const navigate = useNavigate();
    const [collectibles, setCollectibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('Recent');
    useEffect(() => {
        const getCollectibles = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/collectibles/all?sortBy=${sortBy}`);
                setCollectibles(response.data);
            } catch (err) {
                console.error("Failed to get collectibles data.", err);
                setError("Προβλημα με τον server!");
            } finally {
                setLoading(false);
            }
        };

        getCollectibles();
    }, [sortBy]);
    if (loading) {
        return (
            <div className="home loading">
                <div className='Text'>Loading collectibles list</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='home error'>
                <div className='Text error'>Κατι πηγε στραβα με την φορτωση των collectibles! Error:{error}</div>
            </div>
        );
    }

    return (
        <div className="home">
            <h1 className="Collectible-title">All collectibles</h1>
            
            {collectibles.length === 0 ? (
                <div className="Text noCollectiblesMessage">No collectibles found :(</div>
            ) : (

                    <div className="collectiblesGrid">
                        <ComboBox setSortBy={setSortBy} />
                        {collectibles.map(collectible => (
                        <ProductItemPanel product={collectible} key={collectible.product_id} />
                    ))}
                </div>
            )}

            <div className='Collectible-Type'>
                <h1 className='title-Amiibo' onClick={() => navigate('/Collectibles/Amiibos')}>Amiibos</h1>

                {collectibles.length === 0 ? (
                    <div className="Text noCollectiblesMessage">No collectibles found :(</div>
                ) : (
                     <div className="collectiblesGrid">
                            {collectibles.filter(collectible => collectible.collectible_type === "Amiibo" ).map(collectible => (
                                <ProductItemPanel product={collectible} key={collectible.product_id} />
                            ))}
                    </div>
                )}
            </div>

            <div className='Collectible-Type'>
                <h1 className='title-Funko-Pop' onClick={() => navigate('/Collectibles/FunkoPop')}>Funko Pop</h1>

                {collectibles.length === 0 ? (
                    <div className="Text noCollectiblesMessage">No collectibles found :(</div>
                ) : (
                     <div className="collectiblesGrid">
                            {collectibles.filter(collectible => collectible.collectible_type === 'Funko Pop' ).map(collectible => (
                                <ProductItemPanel product={collectible} key={collectible.product_id} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};