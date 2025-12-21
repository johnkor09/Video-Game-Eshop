import { useState, useEffect } from 'react';
import axios from 'axios';
import GameItemPanel from './ItemPanel.js';
import ComboBox from '../ComboBox.js';
import './NintendoGames.css'

export default function NintendoGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('Recent');
    useEffect(() => {
        const getGames = async () => {
            try {
                const platform = ['Nintendo Switch 2', 'Nintendo Switch'];
                const response = await axios.get(`http://localhost:4000/api/games/${platform}?sortBy=${sortBy}`);
                setGames(response.data);
            } catch (err) {
                console.error("Failed to get games data.", err);
                setError("Προβλημα με τον server!");
            } finally {
                setLoading(false);
            }
        };

        getGames();
    }, [sortBy]);
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
                <div className='Text error'>Κατι πηγε στραβα με την φορτωση παιχνιδιων! Error:{error}</div>
            </div>
        );
    }
   
    return (
        <div className="home">
            <div className='Platform'>
                <h1 className='title-Nintendo-NintendoGames'>Nintendo Switch 2</h1>
                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                        <div className="gamesGrid">
                            <ComboBox setSortBy={setSortBy} />
                        {games.map(game => (
                                <GameItemPanel product={game} key={game.product_id} />
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
};