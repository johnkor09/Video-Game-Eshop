import './Header.css';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBasket } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";

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

                <CiLogin  className="logginButton"
                    onClick={() => navigate('/login')}/>

               <FaShoppingBasket className='basket'/>
            </div>
        </header>
    );
}
