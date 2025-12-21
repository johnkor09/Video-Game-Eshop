import './OrderComplete.css';
import { useNavigate } from 'react-router-dom';

export default function OrderComplete() {
    const navigate = useNavigate();
    return (

        <div className="Message">
            <h2 className="head">We have received your order!</h2>
            <button className='Return' onClick={() => navigate('/')}>Return to homepage</button>
        </div>
    );
}
