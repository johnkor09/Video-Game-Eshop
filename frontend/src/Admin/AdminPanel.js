import { useAuth } from '../Authentication/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { RiImageAddLine } from "react-icons/ri";
import { LuSave } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuHardDriveUpload } from "react-icons/lu";
import './AdminPanel.css';
export default function AdminPanel() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectedGame, setSelectedGame] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const { token } = useAuth();
    useEffect(() => {
        const getGames = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/games');
                setGames(response.data);
            } catch (err) {
                console.error("Failed to get games data.", err);
                setError("Προβλημα με τον server!");
            } finally {
                setLoading(false);
            }
        };

        getGames();
    }, []);

    const getGameDetails = async (gameId) => {
        try {
            const response = await axios.get('/api/games/' + gameId);
            setSelectedGame(response.data);
            setFormData(response.data);
        } catch (err) {
            console.error("Failed to get game details.", err);
            setError("Προβλημα με τον server!");
        }
    }

    const handleGameSelect = (event) => {
        const game = event.target.value;
        setImageFile(null);
        setImagePreviewUrl(null);
        if (game === 'none') {
            setSelectedGame(null);
            setFormData({});
            return;
        }

        getGameDetails(game);
    };

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    const handleTrashClick = async () => {
        console.log("trashClick");
        if (!selectedGame) {
            setFormData({});
            setImageFile(null);
            setImagePreviewUrl(null);
            return;
        }

        const confirmDelete = window.confirm(`Είσαι σίγουρος ότι θέλεις να διαγράψεις το παιχνίδι "${selectedGame.title}";`);

        if (!confirmDelete) return;

        if (!token) {
            alert('Δεν είστε συνδεδεμένοι.');
            return;
        }

        try {
            const url = 'http://localhost:4000/api/games/' + selectedGame.game_id;

            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Το παιχνίδι διαγράφηκε επιτυχώς!');

            setGames(prevGames => prevGames.filter(g => g.game_id !== selectedGame.game_id));

            setSelectedGame(null);
            setFormData({});
            setImagePreviewUrl(null);

        } catch (err) {
            console.error("Failed to delete game.", err);
            alert('Αποτυχία διαγραφής: ' + (err.response?.data?.message || err.message));
        }
    }

    const handleImageChange = (event) => {

        setImageFile(null);
        setImagePreviewUrl(null);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setImageFile(file);
        }
        event.target.value = null;
    };

    const handleSave = async () => {
        if (!selectedGame) {
            alert('Επιλεξε ενα παιχνιδι για επεξεργασια.');
            return;
        }

        if (!token) {
            alert('Δεν είστε συνδεδεμένοι.');
            return;
        }
        try {
            const url = 'http://localhost:4000/api/games/' + selectedGame.game_id;
            const response = await axios.put(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Το παιχνίδι ενημερώθηκε επιτυχώς!');
            setGames(prevGames =>
                prevGames.map(g =>
                    g.game_id === selectedGame.game_id ? response.data.game : g
                )
            );
            setSelectedGame(response.data.game);
            setFormData(response.data.game);
        } catch (err) {
            console.error("Failed to update game.", err);
            alert('Αποτυχία ενημέρωσης παιχνιδιού: ' + err.message);
        }
    };

    const handleUpload = async () => {
        if (!formData.title || !formData.price || !formData.platform || !formData.developer || !formData.description_ || !formData.genres || !formData.publisher || !formData.stock_quantity || !formData.releaseDate) {
            alert('Συμπληρωσε τα κενα');
            return;
        }
        if (selectedGame) {
            alert('Επιλεξε none για να λειτουργησει');
            return;
        }

        if (!imageFile) {
            alert('Παρακαλώ επιλέξτε μια φωτογραφία.');
            return;
        }

        if (!token) {
            alert('Δεν είστε συνδεδεμένοι.');
            return;
        }

        const form = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                form.append(key, formData[key]);
            }
        });
        form.append('coverImage', imageFile);

        try {
            const url = 'http://localhost:4000/api/games/upload';
            const response = await axios.post(url, form, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Το παιχνίδι ανέβηκε επιτυχώς!');
            setGames(prevGames => [...prevGames, response.data.game]);

            setSelectedGame(null);
            setFormData({});
            setImagePreviewUrl(null);
        } catch (err) {
            console.error("Failed to create game.", err);
            alert('Αποτυχια δημιουργιας παιχνιδιου: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="AdminPanel-loading">
                <div className='Text'>Loading game list</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='AdminPanel error'>
                <div className='Text error'>Κατι πηγε στραβα με την φορτωση παιχνιδιων! Error:{error}</div>
            </div>
        );
    }
    return (
        <>
            <div className='AdminPanel'>
                <div className='AllAnalytics-grid'>
                    <div className='Analytics-panel'>
                        <div className='Analytics-title'>Analytics</div>
                        <div className='AdminPanel-grid'>
                            <div className='Sales-panel'>
                                <div className='Sales-title'>Weekly Sales</div>
                                {/* weekly */}
                                <div className='Sales-grid'>
                                    <div className='Income'>
                                        <div className='Incometxt'>Income: <div className='money'>1200$</div></div>
                                    </div>
                                    <div className='amount'>Sales: 34</div>
                                </div>
                            </div>
                            {/* monthly */}
                            <div className='Sales-panel'>
                                <div className='Sales-title'>Monthly Sales</div>
                                <div className='Sales-grid'>
                                    <div className='Income'>
                                        <div className='Incometxt'>Income: <div className='money'>5000$</div></div>
                                    </div>
                                    <div className='amount'>Sales: 147</div>
                                </div></div>
                            {/* annual */}
                            <div className='Sales-panel'>
                                <div className='Sales-title'>Annual Sales</div>
                                <div className='Sales-grid'>
                                    <div className='Income'>
                                        <div className='Incometxt'>Income: <div className='money'>73264$</div></div>
                                    </div>
                                    <div className='amount'>Sales: 1574</div>
                                </div></div>
                        </div>
                    </div>
                    <div className='TotalAnalytics-panel'>
                        <div className='TotalAnalytics-title'>Total Analytics</div>

                        <div className='Sales-panel'>
                            <div className='Sales-title'>Total Sales</div>
                            {/* total */}
                            <div className='Sales-grid'>
                                <div className='Income'>
                                    <div className='Incometxt'>Income: <div className='money'>163834$</div></div>
                                </div>
                                <div className='amount'>Sales: 18234</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="EditExistingProducts-panel">
                    <div className='EditExistingProducts-title'>Products</div>
                    <select className="EditExistingProducts-gamelist"
                        onChange={handleGameSelect}
                        value={selectedGame ? selectedGame.game_id : 'none'}
                    >
                        <option value="none">None</option>
                        {games.length === 0 ? (
                            <option value="no-games" disabled>No games found :(</option>
                        ) : (
                            <>
                                {games.map(game => (
                                    <option
                                        key={game.game_id}
                                        value={game.game_id}
                                    >
                                        {game.title}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
                <div className='NewGameForm-panel'>
                    <div className='NewGameForm-title'
                    >{selectedGame ? `Edit Game: ${selectedGame.title}` : 'New Game Form'}
                    </div>
                    <div className='NewGameForm-info-grid'>
                        <div className='ImageInsert-button-container'>
                            <input
                                type="file"
                                id="coverImageUpload"
                                style={{ display: 'none' }}
                                accept=".webp"
                                onChange={handleImageChange}
                                disabled={selectedGame}
                            />

                            <label htmlFor="coverImageUpload" className='ImageInsert-button'>
                                {selectedGame === null ?
                                    (<>
                                        {imagePreviewUrl === null ? (
                                            <RiImageAddLine className='image-icon' />
                                        ) : (
                                            <img className='img-info'
                                                src={imagePreviewUrl || './game_images/placeholder.jpg'}
                                                alt={formData.title}
                                                onError={(e) => { e.target.onerror = null; e.target.src = './game_images/placeholder.jpg'; }}
                                            />
                                        )}
                                    </>
                                    ) : (
                                        <img className='img-info'
                                            src={imagePreviewUrl || "/game_images/" + formData.cover_image_url || './game_images/placeholder.jpg'}
                                            alt={formData.title}
                                            onError={(e) => { e.target.onerror = null; e.target.src = './game_images/placeholder.jpg'; }}
                                        />
                                    )}
                            </label>
                        </div>
                        <div className='info-panel'>
                            <div className='info-grid'>
                                <label className='info-text'>Title:</label>
                                <input className='info-input'
                                    id='title'
                                    maxLength={100}
                                    value={formData.title || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Developer:</label>
                                <input className='info-input'
                                    id='developer'
                                    maxLength={100}
                                    value={formData.developer || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Publisher:</label>
                                <input className='info-input'
                                    id='publisher'
                                    maxLength={100}
                                    value={formData.publisher || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Release Date:</label>
                                <input className='info-input'
                                    type='date'
                                    id='releaseDate'
                                    value={formData.releaseDate || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className='info-panel'>
                            <div className='info-grid'>
                                <label className='info-text'>Platform:</label>
                                <input className='info-input'
                                    id='platform'
                                    maxLength={100}
                                    value={formData.platform || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Genre:</label>
                                <input className='info-input'
                                    id='genres'
                                    maxLength={100}
                                    value={formData.genres || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Price:</label>
                                <input className='info-input'
                                    type='number'
                                    id='price'
                                    min='0'
                                    max='1000'
                                    maxLength={100}
                                    value={formData.price || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Stock:</label>
                                <input className='info-input'
                                    type='number'
                                    min='0'
                                    max='1000'
                                    id='stock_quantity'
                                    value={formData.stock_quantity || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="Button-grid-info">
                            <button className="button-info" onClick={() => handleTrashClick()}><FaRegTrashCan className="buttonicon" /></button>
                            <button className="button-info" onClick={handleSave} disabled={!selectedGame}><LuSave className="buttonicon" /></button>
                            <button className="button-info" onClick={handleUpload} disabled={selectedGame}><LuHardDriveUpload className="buttonicon" /></button>
                        </div>
                    </div>
                    <div className="NewGameInfo-description">
                        <div className="NewGameInfo-descr-title">Description</div>
                        <textarea className="NewGameInfo-descr-input"
                            id='description_'
                            rows="10"
                            value={formData.description_ || ''}
                            onChange={handleInputChange}
                        >
                        </textarea>
                    </div>
                </div>
            </div>
        </>
    );
}