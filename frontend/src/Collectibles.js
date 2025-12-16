import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GameItemPanel from './Items/GameItemPanel.js';
import './Games.css'
import ComboBox from './ComboBox.js';

export default function Collectibles() {
    const navigate = useNavigate();
    const [collectibles, setCollectibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('Recent');
    
    useEffect(() => {
        const getCollectibles = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/games?sortBy=${sortBy}&category=Collectible`);
                setCollectibles(response.data);
            } catch (err) {
                console.error("Failed to get Collectibles data.", err);
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
                <div className='Text'>Loading Collectibles list</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='home error'>
                <div className='Text error'>Κατι πηγε στραβα με την φορτωση Collectibles! Error:{error}</div>
            </div>
        );
    }

    return (
        <div className="home">
            <h1 className="title">All Collectibles</h1>
            
            {collectibles.length === 0 ? (
                <div className="Text noGamesMessage">No games found :(</div>
            ) : (

                    <div className="gamesGrid">
                        <ComboBox setSortBy={setSortBy} />
                        {collectibles.map(item => (
                        <GameItemPanel game={item} key={item.product_id} />
                    ))}
                </div>
            )}

            <div className='Platform'>
                <h1 className='title-Nintendo' onClick={() => navigate('/Collectibles/Pops')}>Funko Pops</h1>

                {collectibles.filter(item => item.platform === "Funko Pop").length === 0 ? (
                    <div className="Text noGamesMessage">No Funko Pops found :(</div>
                ) : (
                     <div className="gamesGrid">
                            {collectibles.filter(item => item.platform === "Funko Pop").map(item => (
                                <GameItemPanel game={item} key={item.product_id} />
                            ))}
                    </div>
                )}
            </div>

            
            <div className='Platform'>
                <h1 className='title-Playstation5' onClick={() => navigate('/Collectibles/Amiibo')}>Amiibo</h1>
                {collectibles.filter(item => item.platform === "Amiibo").length === 0 ? (
                    <div className="Text noGamesMessage">No Amiibo found :(</div>
                ) : (
                        <div className="gamesGrid">
                            {collectibles.filter(item => item.platform === "Amiibo").map(item => (
                                <GameItemPanel game={item} key={item.product_id} />
                            ))}
                    </div>
                )}
            </div>

            <div className='Platform'>
                <h1 className='title-XboxSeries' onClick={() => navigate('/Collectibles/Figures')}>Figures</h1>
                {collectibles.filter(item => item.platform === "Figure" || item.platform === "Statue").length === 0 ? (
                    <div className="Text noGamesMessage">No Figures found :(</div>
                ) : (
                        <div className="gamesGrid">
                        {collectibles.filter(item => item.platform === "Figure").map(item => (
                                <GameItemPanel game={item} key={item.product_id} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};