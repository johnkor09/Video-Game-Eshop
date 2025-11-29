import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Login() {
    let navigate = useNavigate(); //αυτο ειναι για την αλλαγη σελιδας
    const { login } = useAuth(); // Παιρνουμε τη συναρτηση login από το AuthContext
    const [showPassword, setShowPassword] = useState(false); // αυτο ειναι για το κουμπι εμφανισης κωδικου

    const [Data, setData] = useState({ 
        //αρχικοποιηση
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setData({ ...Data, [e.target.id]: e.target.value });
    };

    //οταν πατησουμε το login κουμπι τοτε αυτο εκτελειται!
    const handleLogin = async () => {
        setError('');
        try {
            const api_url = 'http://localhost:5000/api/login';
            //εδω στελνουμε ενα request στο api δλδ στον backend server με τα δεδομενα δλδ email, password
            const response = await axios.post(api_url, Data);

            //αν το succes ειναι true δλδ ειναι σωστα τα στοιχεια τοτε εκτελειται
            //το data ειναι το json απο τον backend σερβερ

            if (response.data.success) {
                // Το response.data.token εiναι το JWT string
                login(response.data.token); //την συναρτηση αυτη την παιρνουμε απο το AuthContext
                //alert(response.data.message);
                navigate('/'); 
            }
        } catch (err) {//error handling
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Unable to communicate with the server.');
            }
        }
    };

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
                    <input
                        type="email"
                        id="email"
                        maxLength={100}
                        value={Data.email}
                        onChange={handleChange}
                    />
                </div>
                <div className='group'>
                    <label className="passwordText">Password:</label>

                    <div className="input-with-button-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            maxLength={64}
                            value={Data.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className='passwordShowHide'
                            onClick={(e) => {
                                e.preventDefault();
                                setShowPassword(!showPassword);
                            }}
                        >
                            {showPassword ? (
                                <VscEyeClosed />
                            ) : (
                                <VscEye />
                            )}
                        </button>
                    </div>
                </div>
                {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

                <div className='Buttons'>
                    <button className='loginButton'
                        onClick={handleLogin}
                    >Login</button>
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