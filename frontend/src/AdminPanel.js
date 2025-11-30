//import { useAuth } from './Authentication/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

export default function AdminPanel() {
    let navigate = useNavigate();
    return(
        <div className='panel'>
            <div className='text'>Admin Panel</div>
            <div className='backbutton'
                onClick={() => navigate('/')}
            >Back</div>
        </div>
    );
}