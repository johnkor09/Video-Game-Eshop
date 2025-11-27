import './Header.css';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBasket } from "react-icons/fa";

export default function Header() {
    let navigate = useNavigate();
    return (
        <header className="Header">
            <h1 className="Title">Brasidas Store HD</h1>
            <div className="Header-Buttons">

                <button
                    className="Button"
                    onClick={() => navigate('/signup')}
                >Sing up</button>

                <button className="Button"
                    onClick={() => navigate('/login')}
                >Login
                </button>

               <FaShoppingBasket className='basket'/>
            </div>
        </header>
    );
}
