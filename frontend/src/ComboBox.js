import './ComboBox.css';
import React, { useState } from 'react';

export default function ComboBox({ setSortBy }) {
        const [selectedOption, setSelectedOption] = useState("Recent");

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
        setSortBy(event.target.value);
        };

        return (
            <div className='ComboBox'>
                <select className='ComboBoxStyle' value={selectedOption} onChange={handleChange}>
                    <option value="Recent">Recently added</option>
                    <option value="Alphabetical">Alphabetical A-Z</option>
                    <option value="Low-High">Price Low-High</option>
                    <option value="High-Low">Price High-Low</option>
                </select>
            </div>
        );
};