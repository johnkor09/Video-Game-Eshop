import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GameItemPanel from './Items/GameItemPanel.js';
import './Games.css'
import ComboBox from './ComboBox.js';
export default function Home() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('Recent');
    useEffect(() => {
        const getGames = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/games?sortBy=${sortBy}&category=Game`);
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
            <h1 className="title">All platforms</h1>
            
            {games.length === 0 ? (
                <div className="Text noGamesMessage">No games found :(</div>
            ) : (

                    <div className="gamesGrid">
                        <ComboBox setSortBy={setSortBy} />
                        {games.map(game => (
                        <GameItemPanel game={game} key={game.product_id} />
                    ))}
                </div>
            )}

            <div className='Platform'>
                <h1 className='title-Nintendo' onClick={() => navigate('/Games/Nintendo')}>Nintendo Switch 2</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                     <div className="gamesGrid">
                            {games.filter(game => game.platform === "Nintendo Switch 2" || game.platform === "Nintendo Switch").map(game => (
                                <GameItemPanel game={game} key={game.product_id} />
                            ))}
                    </div>
                )}
            </div>

            
            <div className='Platform'>
                <h1 className='title-Playstation5' onClick={() => navigate('/Games/Playstation')}>Playstation 5</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                        <div className="gamesGrid">
                            {games.filter(game => game.platform === "Playstation 5" || game.platform === "Playstation 4").map(game => (
                                <GameItemPanel game={game} key={game.product_id} />
                            ))}
                    </div>
                )}
            </div>

            <div className='Platform'>
                <h1 className='title-XboxSeries' onClick={() => navigate('/Games/Xbox')}>Xbox Series</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                        <div className="gamesGrid">
                        {games.filter(game => game.platform === "Xbox Series").map(game => (
                                <GameItemPanel game={game} key={game.product_id} />
                            ))}
                    </div>
                )}
            </div>

            <div className='Platform'>
                <h1 className='title-PC' onClick={() => navigate('/Games/Pc')}>PC</h1>

                {games.length === 0 ? (
                    <div className="Text noGamesMessage">No games found :(</div>
                ) : (
                        <div className="gamesGrid">
                        {games.filter(game => game.platform === "PC").map(game => (
                                <GameItemPanel game={game} key={game.product_id} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};