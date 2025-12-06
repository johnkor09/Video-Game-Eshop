//import { useAuth } from './Authentication/AuthContext';
//import { useNavigate } from 'react-router-dom';
import { RiImageAddLine } from "react-icons/ri";
import { LuSave } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuHardDriveUpload } from "react-icons/lu";
import './AdminPanel.css';
/* Prepei na to kanw otan kanei logout na me petaei apo to admin panel
    kai otidhpote kanw edw tha tsekarw an einai ontws admin */
export default function AdminPanel() {
    //let navigate = useNavigate();
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
                            {/* weekly */}
                            <div className='Sales-grid'>
                                <div className='Income'>
                                    <div className='Incometxt'>Income: <div className='money'>163834$</div></div>
                                </div>
                                <div className='amount'>Sales: 18234</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='NewGameForm-panel'>
                    <div className='NewGameForm-title'>New Game Form</div>
                    <div className='NewGameForm-info-grid'>
                        <div className='ImageInsert-button'><RiImageAddLine className='image-icon' /></div>
                        <div className='info-panel'>
                            <div className='info-grid'>
                                <label className='info-text'>Title:</label>
                                <input className='info-input'
                                    id='gameTitle'
                                    maxLength={100}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Developer:</label>
                                <input className='info-input'
                                    id='developer'
                                    maxLength={100}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Publisher:</label>
                                <input className='info-input'
                                    id='publisher'
                                    maxLength={100}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Release Date:</label>
                                <input className='info-input'
                                    type='date'
                                    id='releaseDate'
                                />
                            </div>
                        </div>
                        <div className='info-panel'>
                            <div className='info-grid'>
                                <label className='info-text'>Platform:</label>
                                <input className='info-input'
                                    id='platform'
                                    maxLength={100}
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Genre:</label>
                                <input className='info-input'
                                    id='genres'
                                    maxLength={100}
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
                                />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Stock:</label>
                                <input className='info-input'
                                    type='number'
                                    min='0'
                                    max='1000'
                                    id='stock'
                                />
                            </div>
                        </div>
                        <div className="Button-grid-info">
                            <button className="button-info"><FaRegTrashCan className="buttonicon" /></button>
                            <button className="button-info"><LuSave className="buttonicon" /></button>
                            <button className="button-info"><LuHardDriveUpload className="buttonicon" /></button>
                        </div>
                    </div>
                    <div className="NewGameInfo-description">
                        <div className="NewGameInfo-descr-title">Description</div>
                        <textarea className="NewGameInfo-descr-input"
                            id='description'
                            rows="10"
                        >
                        </textarea>
                    </div>
                </div>
            </div>
        </>
    );
}