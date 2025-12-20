import { Link } from 'react-router-dom';
import './ItemPanel.css';

const GameItemPanel = ({ product }) => {
    if (!product) return null;
    let detailUrl = '#';
    
    switch (product.product_type) {
        case 'game':
            detailUrl = `/game/${product.product_id}`;
            break;
        case 'collectible':
            detailUrl = `/collectible/${product.product_id}`; 
            break;
        case 'accessory':
            detailUrl = `/accessories/${product.product_id}`;
            break;
        default:
            detailUrl = `/other/${product.product_id}`;
    }
    const imageUrl = product.cover_image_url 
        ? `/product_images/${product.cover_image_url}` 
        : './game_images/placeholder.jpg';
        
        return (
        <div className="item-panel-container">
            <Link to={detailUrl} className="item-panel-link">
                <img
                    src={imageUrl}
                    alt={product.title}
                    className="item-panel-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400?text=No+Image'; }}
                />
                <div className="item-panel-info">
                    <h3 className="item-panel-title">{product.title}</h3>
                    <p className="item-panel-price">€{product.price ? product.price : 'N/A'}</p>
                    
                    {product.product_type === 'game' && (
                        <p className="item-panel-platform">Platform: {product.platform}</p>
                    )}
                    {product.product_type !== 'game' && (
                        <p className="item-panel-type">{product.product_type?.toUpperCase()}</p>
                    )}
                </div>
            </Link>
        </div>
    );

};

export default GameItemPanel;