import './Login.css';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router";
export default function Login() {
    let navigate = useNavigate();
    return (
        <div>
            <div className="Text">
                <div>You are at the login page :O</div>
            </div>
            <div className="loginPanel">
                <div className='LoginText'>
                    <label>Login</label>
                </div>
                <div className='group'>
                    <label className="emailText">Email:</label>
                    <input type="email" id="email" maxLength={100} />
                </div>
                <div className='group'>
                    <label className="passwordText">Password:</label>
                    <input type="password" id="password" maxLength={64} />
                </div>
                <div className='Buttons'>
                    <button className='loginButton'>Login</button>
                    <button className='cancelButton'
                        onClick={() => navigate('/')}
                    >Cancel</button>
                </div>
                <div className='noAccMsg'>
                    <label >Don't have an account yet?</label>
                    <Link to={"/signup"}>Create a new Account</Link>
                </div>



            </div>
        </div>

    );
}