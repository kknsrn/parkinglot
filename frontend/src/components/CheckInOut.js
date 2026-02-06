import React, { useState } from 'react';
import { parkingAPI } from '../services/api';
import { formatDuration, formatCurrency, formatDateTime, isValidLicensePlate, sanitizeLicensePlate } from '../utils/helpers';
import '../styles/CheckInOut.css';

const CheckInOut = () => {
    const [licensePlate, setLicensePlate] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('checkin');

    const handleCheckIn = async () => {
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
        setResult(null);

        try {
            const response = await parkingAPI.checkIn(plate);
            setResult({ type: 'checkin', data: response.data });
            setLicensePlate('');
        } catch (err) {
            setError(err.response?.data?.error || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
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
        setResult(null);

        try {
            const response = await parkingAPI.checkOut(plate);
            setResult({ type: 'checkout', data: response.data });
            setLicensePlate('');
        } catch (err) {
            setError(err.response?.data?.error || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkinout-container">
            <div className="checkinout-card">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'checkin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('checkin')}
                    >
                        ✓ Check-In
                    </button>
                    <button
                        className={`tab ${activeTab === 'checkout' ? 'active' : ''}`}
                        onClick={() => setActiveTab('checkout')}
                    >
                        ✕ Check-Out
                    </button>
                </div>

                <div className="form-group">
                    <label>License Plate</label>
                    <input
                        type="text"
                        placeholder="Enter vehicle license plate"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                        disabled={loading}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                activeTab === 'checkin' ? handleCheckIn() : handleCheckOut();
                            }
                        }}
                    />
                </div>

                <button
                    className="btn btn-primary"
                    onClick={activeTab === 'checkin' ? handleCheckIn : handleCheckOut}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : activeTab === 'checkin' ? 'Check-In' : 'Check-Out'}
                </button>

                {error && <div className="alert alert-error">{error}</div>}

                {result && (
                    <div className="result">
                        {result.type === 'checkin' ? (
                            <div className="success">
                                <h3>✓ Check-In Successful</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Vehicle</span>
                                        <span className="value">{result.data.vehicle.licensePlate}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Type</span>
                                        <span className="value">{result.data.vehicle.type}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Floor</span>
                                        <span className="value">{result.data.parkingSpace.floorNumber}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Space</span>
                                        <span className="value">{result.data.parkingSpace.spaceNumber}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Time</span>
                                        <span className="value">
                                            {formatDateTime(result.data.checkInTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="success">
                                <h3>✓ Check-Out Successful</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Vehicle</span>
                                        <span className="value">{result.data.vehicle.licensePlate}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Type</span>
                                        <span className="value">{result.data.vehicle.type}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Duration</span>
                                        <span className="value">
                                            {formatDuration(result.data.feeDetails.durationMinutes)}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Hourly Rate</span>
                                        <span className="value">
                                            {formatCurrency(result.data.feeDetails.hourlyRate)}/hr
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Total Fee</span>
                                        <span className="value fee">
                                            {formatCurrency(result.data.feeDetails.finalFee)}
                                        </span>
                                    </div>
                                    {result.data.feeDetails.isDailyCapped && (
                                        <div className="info-item">
                                            <span className="label">Note</span>
                                            <span className="value">Daily cap applied</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckInOut;
