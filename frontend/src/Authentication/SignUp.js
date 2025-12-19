import './SignUp.css';
import { useNavigate, Link } from 'react-router-dom';
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
export default function SignUp() {
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const { login } = useAuth();
    let navigate = useNavigate();
    const [Data, setData] = useState({
        //αρχικοποιηση
        name: '',
        surname: '',
        email: '',
        pass1: '',
        pass2: ''
    });
    const [error, setError] = useState('');
    const handleChange = (e) => {
        setData({ ...Data, [e.target.id]: e.target.value });
    };

    const handleSignup = async () => {
        setError('');
        if(Data.name.match(/^(?=.*[aeiouAEIOU])[a-zA-Z]{2,}$/) === null)
        {setError('Enter your name.');}
        else if(Data.surname.match(/^(?=.*[aeiouAEIOU])[a-zA-Z]{2,}$/) === null)
        {setError('Enter your surname.');}
        else if(Data.email.match(/^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)===null)
        {setError('Email is invalid!');}
        else if (Data.pass1 !== Data.pass2) { setError('Passwords don\'t match!'); }
        else if(Data.pass1.match(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)===null)
        {setError('Password must contain 8 characters, at least one letter, one number and one @$!%*#!');}
        else {
            try {
                const api_url = 'http://localhost:4000/api/auth/signup';
                //εδω στελνουμε ενα request στο api δλδ στον backend server με τα δεδομενα
                const response = await axios.post(api_url, Data);
                //αν το succes ειναι true δλδ ειναι σωστα τα στοιχεια τοτε εκτελειται
                //το data ειναι το json απο τον backend σερβερ
                if (response.data.success) {
                    // Το response.data.token εiναι το JWT string
                    login(response.data.token); //την συναρτηση αυτη την παιρνουμε απο το AuthContext
                    //alert(response.data.message);
                    navigate('/');
                }
                else{
                    setError(response.data.message);
                    return;
                }
            } catch (err) {//error handling
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Unable to communicate with the server.');
                }
            }
        }
    };

    return (

        <div className="signupPanel">
            <div className='signupText'>
                <label>Sign-up</label>
            </div>
            <div className='group'>
                <label className="nameText">Name:</label>
                <input
                    id="name"
                    maxLength={30}
                    value={Data.name}
                    onChange={handleChange}
                />
            </div>
            <div className='group'>
                <label className="surnameText">Surname:</label>
                <input
                    id="surname"
                    maxLength={30}
                    value={Data.surname}
                    onChange={handleChange}
                />
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
                        type={showPassword1 ? "text" : "password"}
                        id="pass1"
                        maxLength={64}
                        value={Data.pass1}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className='passwordShowHide'
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPassword1(!showPassword1);
                        }}
                    >
                        {showPassword1 ? (
                            <VscEyeClosed />
                        ) : (
                            <VscEye />
                        )}
                    </button>
                </div>
            </div>
            <div className='group'>
                <label className="passwordText">Confirm Password:</label>
                <div className="input-with-button-container">
                    <input
                        type={showPassword2 ? "text" : "password"}
                        id="pass2"
                        maxLength={64}
                        value={Data.pass2}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className='passwordShowHide'
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPassword2(!showPassword2);
                        }}
                    >
                        {showPassword2 ? (
                            <VscEyeClosed />
                        ) : (
                            <VscEye />
                        )}
                    </button>
                </div>
            </div>
            {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

            <button className='signupButton' onClick={handleSignup}>CREATE ACCOUNT</button>
            <Link className='cancel' to={"/"}>Cancel</Link>
            <div className='AlreadyGotAccMsg'>
                <label >Already got an account?</label>
                <Link to={"/login"}>Login</Link>
            </div>
        </div>

    );
}