import { useState, useEffect } from 'react';
import axios from 'axios';
import GameItemPanel from './GameItemPanel.js';
import ComboBox from '../ComboBox.js';
import './NintendoGames.css'

export default function NintendoGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getGames = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/games/nintendo');
                setGames(response.data);
            } catch (err) {
                console.error("Failed to get games data.", err);
                setError("Προβλημα με τον server!");
            } finally {
                setLoading(false);
            }
        };

        getGames();
    }, []);
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
                <ComboBox/>
                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                    <div className="gamesGrid">
                        {games.map(game => (
                                <GameItemPanel game={game} key={game.game_id} />
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
};