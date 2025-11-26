import './ItemTab.css';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function ItemTab() {
    const navigate= useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div>
            <div  className="ItemTabStyle">
                <h4 onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="CategoryStyle">Games</h4>
                <h4 className="CategoryStyle">Accesories</h4>
                <h4 className="CategoryStyle">Collectables</h4>
                <input type="text" className="SerchBox" />
            </div>
            {isHovered && (
                <div className="BoxStyle" onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                <div>
                    <div className="CategoryStyle2"
                    onClick={() => navigate('/')}
                    >Nintendo Games</div>
                    <div className="CategoryStyle2"
                    onClick={() => navigate('/')}
                    >Playstation Games</div>
                    <div className="CategoryStyle2"
                    onClick={() => navigate('/')}
                    >Xbox Games</div>
                    <div className="CategoryStyle2"
                    onClick={() => navigate('/')}
                    >Pc Games</div>
                    <div className="CategoryStyle2"
                    onClick={() => navigate('/')}
                    >Giftcards</div>
                </div>
            </div>)}
        </div>
    );
}
