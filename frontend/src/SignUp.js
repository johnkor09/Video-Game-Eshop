import './SignUp.css';
import { useNavigate } from 'react-router-dom';
export default function SignUp() {
    let navigate = useNavigate();
    return (
        <div>
            <button className="BackButton"
                onClick={() => navigate('/')}
            >Back to Home</button>
            <div className="Text">
                <div>You are at the SignUp page :]</div>
            </div>
        </div>

    );
}