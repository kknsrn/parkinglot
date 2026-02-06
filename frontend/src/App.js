import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CheckInOut from './components/CheckInOut';
import VehicleStatus from './components/VehicleStatus';
import './styles/global.css';
import './styles/App.css';

function App() {
    const [activeNav, setActiveNav] = useState('dashboard');

    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                    <div className="navbar-brand">
                        <h1>🅿️ Smart Parking Lot</h1>
                    </div>
                    <ul className="nav-links">
                        <li>
                            <Link
                                to="/"
                                className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveNav('dashboard')}
                            >
                                📊 Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/checkin-out"
                                className={`nav-link ${activeNav === 'checkin' ? 'active' : ''}`}
                                onClick={() => setActiveNav('checkin')}
                            >
                                🚗 Check In/Out
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/vehicle-status"
                                className={`nav-link ${activeNav === 'status' ? 'active' : ''}`}
                                onClick={() => setActiveNav('status')}
                            >
                                📍 Vehicle Status
                            </Link>
                        </li>
                    </ul>
                </nav>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/checkin-out" element={<CheckInOut />} />
                        <Route path="/vehicle-status" element={<VehicleStatus />} />
                    </Routes>
                </main>

                <footer className="footer">
                    <p>&copy; 2026 Smart Parking Lot Management System. All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
