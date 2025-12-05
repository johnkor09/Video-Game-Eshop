import './ComboBox.css';

export default function ItemTab() {
    return (
        <div className='ComboBox'>
            <select className='ComboBoxStyle'>
                <option value="Recent">Recently added</option>
                <option value="Low-High">Price Low-High</option>
                <option value="High-Low">Price High-Low</option>
            </select>
        </div>
    );
}