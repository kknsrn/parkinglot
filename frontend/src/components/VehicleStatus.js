import React, { useState } from 'react';
import { parkingAPI } from '../services/api';
import { formatDateTime, formatDuration, formatCurrency, isValidLicensePlate, sanitizeLicensePlate } from '../utils/helpers';
import '../styles/VehicleStatus.css';

const VehicleStatus = () => {
    const [licensePlate, setLicensePlate] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('status');

    const handleSearch = async () => {
        if (!licensePlate.trim()) {
            setError('Please enter a license plate');
            return;
        }

        const plate = sanitizeLicensePlate(licensePlate);
        if (!isValidLicensePlate(plate)) {
            setError('Invalid license plate format');
            return;
        }

        setLoading(true);
        setError(null);
        setStatusData(null);
        setHistoryData(null);

        try {
            const [statusRes, historyRes] = await Promise.all([
                parkingAPI.getStatus(plate),
                parkingAPI.getHistory(plate),
            ]);

            setStatusData(statusRes.data);
            setHistoryData(historyRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch vehicle data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vehicle-status-container">
            <div className="search-section">
                <h2>Vehicle Status & History</h2>
                <div className="search-form">
                    <input
                        type="text"
                        placeholder="Enter license plate"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                        disabled={loading}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
            </div>

            {statusData && (
                <div className="results-section">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'status' ? 'active' : ''}`}
                            onClick={() => setActiveTab('status')}
                        >
                            Current Status
                        </button>
                        <button
                            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Parking History
                        </button>
                    </div>

                    {activeTab === 'status' && (
                        <div className="status-content">
                            <div className="vehicle-info">
                                <h3>Vehicle Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">License Plate</span>
                                        <span className="value">{statusData.vehicle.licensePlate}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Vehicle Type</span>
                                        <span className="value">{statusData.vehicle.type}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Status</span>
                                        <span className={`value status-${statusData.status}`}>
                                            {statusData.status === 'parked' ? '🟢 Parked' : '⚪ Not Parked'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {statusData.status === 'parked' && statusData.parkingDetails && (
                                <div className="parking-details">
                                    <h3>Current Parking Details</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">Floor</span>
                                            <span className="value">{statusData.parkingDetails.floor}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Space</span>
                                            <span className="value">{statusData.parkingDetails.space}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Check-In Time</span>
                                            <span className="value">
                                                {formatDateTime(statusData.parkingDetails.checkInTime)}
                                            </span>
                                        </div>
                                    </div>

                                    {statusData.feePreview && (
                                        <div className="fee-preview">
                                            <h4>Estimated Fee Preview</h4>
                                            <div className="preview-grid">
                                                <div className="preview-item">
                                                    <span className="label">Duration</span>
                                                    <span className="value">
                                                        {formatDuration(statusData.feePreview.durationMinutes)}
                                                    </span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="label">Estimated Fee</span>
                                                    <span className="value fee">
                                                        {formatCurrency(statusData.feePreview.estimatedFee)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && historyData && (
                        <div className="history-content">
                            <h3>Parking History</h3>
                            {historyData.history && historyData.history.length > 0 ? (
                                <div className="history-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Check-In</th>
                                                <th>Check-Out</th>
                                                <th>Duration</th>
                                                <th>Floor</th>
                                                <th>Space</th>
                                                <th>Fee</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyData.history.map((record) => (
                                                <tr key={record.transactionId}>
                                                    <td>{formatDateTime(record.checkInTime)}</td>
                                                    <td>{formatDateTime(record.checkOutTime)}</td>
                                                    <td>{record.duration}</td>
                                                    <td>{record.floor}</td>
                                                    <td>{record.space}</td>
                                                    <td className="fee">{record.fee}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-history">No parking history found</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VehicleStatus;
