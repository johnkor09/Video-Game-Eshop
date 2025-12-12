import './ItemTab.css';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { HiSearch } from "react-icons/hi";

export default function ItemTab() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className='itemTab'>
            <div className="ItemTabStyle">
                <h4 onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => { setIsHovered(false) }}
                    className="CategoryStyle"
                    onClick={() => navigate('/Games')}
                    >Games</h4>
                <h4 className="CategoryStyle">Accessories</h4>
                <h4 className="CategoryStyle">Collectibles</h4>
                <div className='searchBar'>
                    <HiSearch className="SearchButton" />
                    <input type="text" className="SerchBox" placeholder="Search.."/>
                </div>
            </div>
            {isHovered && (
                <div className="BoxStyle" onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                    <div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Games/Nintendo')}
                        >Nintendo Games</div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Games/Playstation')}
                        >Playstation Games</div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Games/Xbox')}
                        >Xbox Games</div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Games/Pc')}
                        >Pc Games</div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/')}
                        >Giftcards</div>
                    </div>
                </div>)}
        </div>
    );
}
