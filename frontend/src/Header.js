import './Header.css';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBasket } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { useAuth } from './AuthContext';

export default function Header() {
    let navigate = useNavigate();
    const { isLoggedIn, user, logout } = useAuth();
    return (
        <header className="Header">
            <h1 className="Title">Brasidas Store HD</h1>
            <div className="Header-Buttons">
                {isLoggedIn ? (
                    <>
                        <span className="WelcomeText">
                            Welcome, {user?.email}
                        </span>

                        <button
                            className="Button"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="Button"
                            onClick={() => navigate('/signup')}
                        >
                            Sign up
                        </button>
                        <CiLogin
                            className="logginButton"
                            onClick={() => navigate('/login')}
                        />
                    </>
                )}
                <FaShoppingBasket className='basket' onClick={() => navigate('/basket')} />
            </div>
        </header>
    );
}
