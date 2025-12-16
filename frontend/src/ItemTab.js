import './ItemTab.css';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { HiSearch } from "react-icons/hi";

export default function ItemTab() {
    const navigate = useNavigate();

    const [showGamesMenu, setShowGamesMenu] = useState(false);
    const [showCollectiblesMenu, setShowCollectiblesMenu] = useState(false);

    return (
        <div className='itemTab'>
            <div className="ItemTabStyle">

                <div className="category"
                    onMouseEnter={() => setShowGamesMenu(true)}
                    onMouseLeave={() => { setShowGamesMenu(false) }}
                >
                    <h4 className="CategoryStyle"
                        onClick={() => navigate('/Games')}
                        >Games</h4>
                {showGamesMenu && (
                    <div className="BoxStyle">
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
                    )}
                    </div>

                <h4 className="CategoryStyle">Accessories</h4>

                <div className="category"
                    onMouseEnter={() => setShowCollectiblesMenu(true)}
                    onMouseLeave={() => { setShowCollectiblesMenu(false) }}
                >
                    <h4 className="CategoryStyle" 
                        onClick={() => navigate('/Collectibles')}
                        >Collectibles</h4>
                {showCollectiblesMenu && (
                <div className="BoxStyle">
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Collectibles/Pops')}
                        >Funko Pops</div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Collectibles/Amiibo')}>Amiibo</div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Collectibles/Figures')}
                        >Figures</div>
                        <div className="CategoryStyle2"
                            onClick={() => navigate('/Collectibles')}
                        >All Collectibles</div>
                    </div>
                )}
                </div>
            

                <div className='searchBar'>
                    <HiSearch className="SearchButton" />
                    <input type="text" className="SerchBox" placeholder="Search.."/>
                </div>

            </div>
        </div>
    );
}
