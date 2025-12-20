import './AdminPanel.css';
import { useNavigate } from 'react-router-dom';


export default function AdminAnalytics() {
    const navigate = useNavigate();
    return (
        <div className='AdminPanel-Header'>
            <div className='AdminPanel-Header-Options'>
                <div className='AdminPanel-Header-Option' onClick={()=> navigate('/admin-panel/analytics')}>Analytics</div>
                <div className='AdminPanel-Header-Option' onClick={()=> navigate('/admin-panel/products')}>Products</div>
            </div>

        </div>
    );
}