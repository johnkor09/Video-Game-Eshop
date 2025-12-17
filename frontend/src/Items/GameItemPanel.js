import {Link} from 'react-router-dom';
import './GameItemPanel.css';

const GameItemPanel = ({ game }) => {
    const detailUrl = '/Games/'+game.platform+'/'+game.product_id;

    return (
        <div className="game-panel-container">
            <Link to={detailUrl} className="game-panel-link" >
                <img 
                    src={"/game_images/"+game.cover_image_url || './game_images/placeholder.jpg'} 
                    alt={game.title} 
                    className="game-panel-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = './game_images/placeholder.jpg'; }}
                />
                <div className="game-panel-info">
                    <h3 className="game-panel-title">{game.title}</h3>
                    <p className="game-panel-price">€{game.price ? game.price : 'N/A'}</p>
                    <p className="game-panel-platform">Platform: {game.platform}</p>
                </div>
            </Link>
        </div>
    );
};

export default GameItemPanel;