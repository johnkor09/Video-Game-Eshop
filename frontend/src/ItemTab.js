import './ItemTab.css';
import { useState } from "react";

export default function ItemTab() {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div>
            <div  className="ItemTabStyle">
                <h4 onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="CategoryStyle">Games</h4>
                <h4 className="CategoryStyle">Accesories</h4>
                <h4 className="CategoryStyle">Collectables</h4>
            </div>
            {isHovered && (
                <div className="BoxStyle" onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                <u1>
                    <h6 className="CategoryStyle">Nintendo Games</h6>
                    <h6 className="CategoryStyle">Playstation Games</h6>
                    <h6 className="CategoryStyle">Xbox Games</h6>
                    <h6 className="CategoryStyle">Pc Games</h6>
                    <h6 className="CategoryStyle">Giftcards</h6>
                </u1>
            </div>)}
        </div>
    );
}
