import './AdminPanel.css';
import AdminHeader from './AdminHeader.js'
export default function AdminPanel({ Panel }) {
    return (
        <><AdminHeader />
            <div className='AdminPanel'>
                
                <Panel />
            </div>
        </>
    );
}