import './Login.css';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    let navigate = useNavigate();
    return (
        <div>
            <button className = "BackButton"
            onClick={()=>navigate('/')}
            >Back to Home</button>
        <div className="Text">
            <div>You are at the login page :O</div>
        </div>
        </div>
        
    );
}