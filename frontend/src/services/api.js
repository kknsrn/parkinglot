import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Parking API Service
 */
export const parkingAPI = {
    // Check-in
    checkIn: (licensePlate) =>
        apiClient.post('/parking/checkin', { licensePlate }),

    // Check-out
    checkOut: (licensePlate) =>
        apiClient.post('/parking/checkout', { licensePlate }),

    // Get vehicle status
    getStatus: (licensePlate) =>
        apiClient.get(`/parking/status/${licensePlate}`),

    // Get vehicle history
    getHistory: (licensePlate) =>
        apiClient.get(`/parking/history/${licensePlate}`),

    // Get lot status
    getLotStatus: () =>
        apiClient.get('/parking/lot-status'),

    // Get availability
    getAvailability: () =>
        apiClient.get('/parking/availability'),

    // Preview fee
    previewFee: (transactionId) =>
        apiClient.post('/parking/preview-fee', { transactionId }),
};

/**
 * Vehicle API Service
 */
export const vehicleAPI = {
    // Register vehicle
    register: (licensePlate, vehicleType, ownerName, ownerContact) =>
        apiClient.post('/parking/vehicle/register', {
            licensePlate,
            vehicleType,
            ownerName,
            ownerContact,
        }),

    // Get vehicle details
    getVehicle: (licensePlate) =>
        apiClient.get(`/parking/vehicle/${licensePlate}`),

    // Get all vehicles
    getAllVehicles: () =>
        apiClient.get('/parking/vehicles'),

    // Get vehicle types
    getVehicleTypes: () =>
        apiClient.get('/parking/vehicle-types'),
};

export default apiClient;
