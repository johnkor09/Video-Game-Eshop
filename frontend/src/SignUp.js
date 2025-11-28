import './SignUp.css';
import { useNavigate } from 'react-router-dom';
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import { useState } from 'react';
export default function SignUp() {
    let navigate = useNavigate();
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    return (
        <div>
            <div className="Text">
                <div>You are at the SignUp page :]</div>
            </div>
            <div className="signupPanel">
                <div className='signupText'>
                    <label>Sign-up</label>
                </div>
                <div className='group'>
                    <label className="nameText">Name:</label>
                    <input id="name" maxLength={30} />
                </div>
                <div className='group'>
                    <label className="surnameText">Surname:</label>
                    <input id="surnname" maxLength={30} />
                </div>
                <div className='group'>
                    <label className="emailText">Email:</label>
                    <input type="email" id="email" maxLength={100} />
                </div>
                <div className='group'>
                    <label className="passwordText">Password:</label>
                    <div className="input-with-button-container">
                        <input
                            type={showPassword1 ? "text" : "password"}
                            id="password"
                            maxLength={64}
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
                            id="password"
                            maxLength={64}
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
                <div className='Buttons'>
                    <button className='signupButton'>Create Account</button>
                    <button className='cancelButton'
                        onClick={() => navigate('/')}
                    >Cancel</button>
                </div>



            </div>
        </div>

    );
}