import './AdminPanel.css';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Authentication/AuthContext';

export default function AdminAnalytics() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        weekly: { income: 0, sales: 0 },
        monthly: { income: 0, sales: 0 },
        annual: { income: 0, sales: 0 },
        total: { income: 0, sales: 0 }
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/admin/analytics', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            }
        };

        fetchAnalytics();
    }, [token]);

    return (
        <div className='AllAnalytics-grid'>
            <div className='Analytics-panel'>
                <div className='Analytics-title'>Analytics</div>
                <div className='AdminPanel-grid'>
                    {/* weekly */}
                    <div className='Sales-panel'>
                        <div className='Sales-title'>Weekly Sales</div>
                        <div className='Sales-grid'>
                            <div className='Income'>
                                <div className='Incometxt'>Income: <div className='money'>{stats.weekly.income}$</div></div>
                            </div>
                            <div className='amount'>Sales: {stats.weekly.sales}</div>
                        </div>
                    </div>
                    {/* monthly */}
                    <div className='Sales-panel'>
                        <div className='Sales-title'>Monthly Sales</div>
                        <div className='Sales-grid'>
                            <div className='Income'>
                                <div className='Incometxt'>Income: <div className='money'>{stats.monthly.income}$</div></div>
                            </div>
                            <div className='amount'>Sales: {stats.monthly.sales}</div>
                        </div>
                    </div>
                    {/* annual */}
                    <div className='Sales-panel'>
                        <div className='Sales-title'>Annual Sales</div>
                        <div className='Sales-grid'>
                            <div className='Income'>
                                <div className='Incometxt'>Income: <div className='money'>{stats.annual.income}$</div></div>
                            </div>
                            <div className='amount'>Sales: {stats.annual.sales}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='TotalAnalytics-panel'>
                <div className='TotalAnalytics-title'>Total Analytics</div>
                <div className='Sales-panel'>
                    <div className='Sales-title'>Total Sales</div>
                    <div className='Sales-grid'>
                        <div className='Income'>
                            <div className='Incometxt'>Income: <div className='money'>{stats.total.income}$</div></div>
                        </div>
                        <div className='amount'>Sales: {stats.total.sales}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}