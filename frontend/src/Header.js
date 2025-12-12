import './Header.css';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBasket } from "react-icons/fa";
import { CiLogin, CiLogout } from "react-icons/ci";
import { GrUserAdmin } from "react-icons/gr";
import { useAuth } from './Authentication/AuthContext';


export default function Header() {
    let navigate = useNavigate();
    const { isLoggedIn, user, logout } = useAuth();
    let detailUrl = 0;
    if (user) {
        detailUrl = '/' + user.id + '/basket';
    }
    return (
        <>
            <header className="Header">
                <h1 className="Title"
                    onClick={() => navigate('/')}
                >Brasidas Store HD</h1>
                <div className="Header-Buttons">
                    {isLoggedIn ? (
                        <>
                            <div >
                                {user.role ? (
                                    <>
                                        <GrUserAdmin className='button'
                                            onClick={() => navigate('/admin-panel')}
                                        />
                                    </>) : (<></>)}
                            </div>

                            <span className="WelcomeText">
                                Welcome, {user?.name}
                            </span>
                            <CiLogout
                                className="button" onClick={() => { logout(); navigate('/'); }}
                            />
                        </>
                    ) : (
                        <>
                            <CiLogin className="button"
                                onClick={() => navigate('/login')}
                            />
                        </>
                    )}
                    {detailUrl === 0 ? (
                        <FaShoppingBasket className='button' onClick={() => navigate('/guest/basket')} />
                    ) : (
                        <FaShoppingBasket className='button' onClick={() => navigate(detailUrl)} />
                    )}


                </div>

            </header >

        </>
    );
}
