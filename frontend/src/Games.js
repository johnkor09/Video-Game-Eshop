import { useState, useEffect } from 'react';
import axios from 'axios';
import GameItemPanel from './Items/GameItemPanel.js';
import './Games.css'

export default function Home() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getGames = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/games');
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

            <div className='Platform'>
                <h1 className='title-Nintendo'>Nintendo Switch 2</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                    <div className="gamesGrid">
                        {games.filter(game => game.platform === "Nintendo Switch 2").map(game => (
                                <GameItemPanel game={game} key={game.game_id} />
                            ))}
                    </div>
                )}
            </div>

            
            <div className='Platform'>
                <h1 className='title-Playstation5'>Playstation 5</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                    <div className="gamesGrid">
                        {games.filter(game => game.platform === "Playstation 5").map(game => (
                                <GameItemPanel game={game} key={game.game_id} />
                            ))}
                    </div>
                )}
            </div>

            <div className='Platform'>
                <h1 className='title-XboxSeries'>Xbox Series</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                    <div className="gamesGrid">
                        {games.filter(game => game.platform === "Xbox Series").map(game => (
                                <GameItemPanel game={game} key={game.game_id} />
                            ))}
                    </div>
                )}
            </div>

            <div className='Platform'>
                <h1 className='title-PC'>PC</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                    <div className="gamesGrid">
                        {games.filter(game => game.platform === "PC").map(game => (
                                <GameItemPanel game={game} key={game.game_id} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};