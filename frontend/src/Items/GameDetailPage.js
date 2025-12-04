import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaShoppingBasket } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GameDetailPage.css';

const GameDetailPage = () => {
    let navigate = useNavigate();

    const { platform, gameId } = useParams();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getGameDetails = async () => {
            if (!platform || !gameId) {
                setError("Λαθος url link παιχνιδιου.")
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('/api/games/' + platform + '/' + gameId);
                setGame(response.data);
            } catch (err) {
                console.error("Failed to get game details.", err);
                let errorMessage = "Προβλημα με τον server!";if (err.response && err.response.status === 404) {
                    errorMessage = "Δεν βρεθηκε το παιχνιδι.";
                } else if (err.request) {
                    errorMessage = "Προβλημα συνδεσης με backend";
                }

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        getGameDetails();

    }, [platform, gameId]);
    if (loading) {
        return (
            <div className="loading">
                <div className='Text'>Loading game's details.</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className='error'>
                <div className='Text error'>Κατι πηγε λαθος με την φορτωση του παιχνιδιου! Error:{error}</div>
            </div>
        );
    }
    if (!game) {
        return (
            <div className='error'>
                <div className='Text error'>Δεν βρεθηκε το παιχνιδι!</div>
            </div>
        );
    }
    const imageUrl = '/game_images/' + game.cover_image_url || './game_images/placeholder.jpg';

    return (
        <div className='detailsPage'>
            <h1 className='gameTitle'>{game.title}</h1>
            <div className='content'>
                <img
                    src={imageUrl}
                    alt={'Cover for' + game.title}
                    className='coverImage'
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/444444/ffffff?text=Image+Missing'; }}
                />
                <div className="info">
                    <p><strong>Platform:</strong> {game.platform}</p>
                    <p><strong>Developer:</strong> {game.developer || 'N/A'}</p>
                    <p><strong>Publisher:</strong> {game.publisher || 'N/A'}</p>
                    <p><strong>Genres:</strong> {game.genres || 'N/A'}</p>
                    <p><strong>Release Date:</strong> {game.release_date ? new Date(game.release_date).toLocaleDateString('el-GR') : 'N/A'}</p>
                    <p><strong>Stock:</strong> {game.stock_quantity > 0 ? game.stock_quantity + ' in stock' : 'Out of Stock'}</p>
                </div>
                
                    <div className='Buttons'>
                        <p className="price"><strong>Price:</strong> €{game.price}</p>
                        <button className='cartButton' onClick={()=> navigate('/')}><FaShoppingBasket/> Add to cart</button>
                    </div>    
                    <div className='description'>
                        <h3 className="descriptionText">Περιγραφή</h3>
                        <p className="descriptionInfo">{game.description_ || 'Δεν υπάρχει διαθέσιμη περιγραφή.'}</p>
                    </div>
                
            </div>

        </div>
    );
};
export default GameDetailPage;