const express = require('express');
const { ParkingController, VehicleController } = require('../controllers/ParkingController');
const { ConcurrencyController } = require('../middlewares');

const router = express.Router();

/**
 * Parking Routes
 */

// Check-in/Check-out with concurrency control
router.post(
    '/checkin',
    ConcurrencyController.middleware((req) => `checkin-${req.body.licensePlate}`),
    ParkingController.checkIn
);

router.post(
    '/checkout',
    ConcurrencyController.middleware((req) => `checkout-${req.body.licensePlate}`),
    ParkingController.checkOut
);

// Status and history
router.get('/status/:licensePlate', ParkingController.getStatus);
router.get('/history/:licensePlate', ParkingController.getHistory);

// Lot status and availability
router.get('/lot-status', ParkingController.getLotStatus);
router.get('/availability', ParkingController.getAvailability);

// Fee management
router.post('/preview-fee', ParkingController.previewFee);

/**
 * Vehicle Routes
 */
router.post('/vehicle/register', VehicleController.register);
router.get('/vehicle/:licensePlate', VehicleController.getVehicle);
router.get('/vehicles', VehicleController.getAllVehicles);
router.get('/vehicle-types', VehicleController.getVehicleTypes);

module.exports = router;
