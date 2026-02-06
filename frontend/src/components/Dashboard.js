import React, { useState, useEffect } from 'react';
import { parkingAPI } from '../services/api';
import { formatDuration, formatCurrency, formatDateTime, calculateOccupancy } from '../utils/helpers';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        // Refresh data every 5 seconds
        const interval = setInterval(fetchDashboardData, 5000);
        setRefreshInterval(interval);

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setError(null);
            const response = await parkingAPI.getLotStatus();
            setDashboardData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="alert alert-error">{error}</div>;
    if (!dashboardData) return <div className="alert alert-error">No data available</div>;

    const { overview, floorStatus, revenue } = dashboardData;
    const occupancyRate = calculateOccupancy(overview.occupiedSpaces, overview.totalSpaces);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Parking Lot Dashboard</h1>
                <button className="btn-refresh" onClick={fetchDashboardData}>
                    ⟳ Refresh
                </button>
            </div>

            {/* Overview Cards */}
            <div className="overview-cards">
                <div className="card">
                    <div className="card-header">Total Spaces</div>
                    <div className="card-value">{overview.totalSpaces}</div>
                </div>

                <div className="card">
                    <div className="card-header">Available</div>
                    <div className="card-value available">{overview.availableSpaces}</div>
                </div>

                <div className="card">
                    <div className="card-header">Occupied</div>
                    <div className="card-value occupied">{overview.occupiedSpaces}</div>
                </div>

                <div className="card">
                    <div className="card-header">Occupancy Rate</div>
                    <div className="card-value">{occupancyRate}%</div>
                </div>
            </div>

            {/* Floor Status */}
            <div className="section">
                <h2>Floor Status</h2>
                <div className="floor-status">
                    {floorStatus.map((floor) => (
                        <div key={floor.floor_number} className="floor-card">
                            <h3>Floor {floor.floor_number}</h3>
                            <div className="floor-info">
                                <div>
                                    <span className="label">Total:</span>
                                    <span className="value">{floor.total_spaces}</span>
                                </div>
                                <div>
                                    <span className="label">Available:</span>
                                    <span className="value available">{floor.available_spaces}</span>
                                </div>
                                <div>
                                    <span className="label">Occupied:</span>
                                    <span className="value occupied">{floor.occupied_spaces}</span>
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${calculateOccupancy(floor.occupied_spaces, floor.total_spaces)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue Stats */}
            <div className="section">
                <h2>Revenue Statistics</h2>
                <div className="revenue-cards">
                    <div className="revenue-card">
                        <span className="label">Active Vehicles</span>
                        <span className="value">{revenue.activeVehicles}</span>
                    </div>
                    <div className="revenue-card">
                        <span className="label">Total Revenue</span>
                        <span className="value">{formatCurrency(revenue.totalRevenue)}</span>
                    </div>
                    <div className="revenue-card">
                        <span className="label">Avg Fee</span>
                        <span className="value">{formatCurrency(revenue.averageFeePerVehicle)}</span>
                    </div>
                    <div className="revenue-card">
                        <span className="label">Completed</span>
                        <span className="value">{revenue.completedVehicles}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
