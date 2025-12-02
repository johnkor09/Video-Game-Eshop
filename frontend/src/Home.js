import { useState, useEffect } from 'react';
import GameItemPanel from './Items/GameItemPanel.js';
import './Home.css'

export default function Home() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getGames = async () => {
            try {
                const response = await fetch('/api/games');

                if (!response.ok) {
                    throw new Error('HTTP error! Status: ' + response.status + '. Failed to get games data.');
                }
                const data = await response.json();
                setGames(data);
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
            <h1 className="title">All platforms</h1>

            {games.length === 0 ? (
                <div className="Text noGamesMessage">No games found :(</div>
            ) : (
                <div className="gamesGrid">
                    {games.map(game => (
                        <GameItemPanel game={game} key={game.game_id} />
                    ))}
                </div>
            )}
        </div>
    );
};