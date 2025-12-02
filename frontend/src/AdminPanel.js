//import { useAuth } from './Authentication/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
/* Prepei na to kanw otan kanei logout na me petaei apo to admin panel
    kai otidhpote kanw edw tha tsekarw an einai ontws admin */
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