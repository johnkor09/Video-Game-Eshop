import './SignUp.css';
import { useNavigate } from 'react-router-dom';
export default function SignUp() {
    let navigate = useNavigate();
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
                    <input  id="name" maxLength={30} />
                </div>
                <div className='group'>
                    <label className="surnameText">Surname:</label>
                    <input  id="surnname" maxLength={30} />
                </div>
                <div className='group'>
                    <label className="emailText">Email:</label>
                    <input type="email" id="email" maxLength={100} />
                </div>
                <div className='group'>
                    <label className="passwordText">Password:</label>
                    <input type="password" id="password" maxLength={64} />
                </div>
                <div className='group'>
                    <label className="passwordText">Confirm Password:</label>
                    <input type="password" id="password" maxLength={64} />
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