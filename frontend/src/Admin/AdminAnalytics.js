import './AdminPanel.css';

export default function AdminAnalytics() {
    return (
        
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
    );
}