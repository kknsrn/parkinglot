const ParkingManagementService = require('../services/ParkingManagementService');
const ParkingSpotAllocationService = require('../services/ParkingSpotAllocationService');
const FeeCalculationService = require('../services/FeeCalculationService');
const Vehicle = require('../models/Vehicle');
const VehicleType = require('../models/VehicleType');
const { isValidLicensePlate, sanitizeLicensePlate } = require('../utils/helpers');

/**
 * ParkingController - Handles HTTP requests for parking operations
 * Ensures proper error handling and response formatting
 */
class ParkingController {
    /**
     * Check-in vehicle
     * POST /api/parking/checkin
     */
    static async checkIn(req, res) {
        try {
            const { licensePlate } = req.body;

            if (!licensePlate) {
                return res.status(400).json({ error: 'License plate is required' });
            }

            const plate = sanitizeLicensePlate(licensePlate);
            if (!isValidLicensePlate(plate)) {
                return res.status(400).json({ error: 'Invalid license plate format' });
            }

            const result = await ParkingManagementService.checkIn(plate);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Check-out vehicle
     * POST /api/parking/checkout
     */
    static async checkOut(req, res) {
        try {
            const { licensePlate } = req.body;

            if (!licensePlate) {
                return res.status(400).json({ error: 'License plate is required' });
            }

            const plate = sanitizeLicensePlate(licensePlate);
            if (!isValidLicensePlate(plate)) {
                return res.status(400).json({ error: 'Invalid license plate format' });
            }

            const result = await ParkingManagementService.checkOut(plate);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get vehicle parking status
     * GET /api/parking/status/:licensePlate
     */
    static async getStatus(req, res) {
        try {
            const { licensePlate } = req.params;

            const plate = sanitizeLicensePlate(licensePlate);
            if (!isValidLicensePlate(plate)) {
                return res.status(400).json({ error: 'Invalid license plate format' });
            }

            const result = await ParkingManagementService.getVehicleStatus(plate);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get vehicle parking history
     * GET /api/parking/history/:licensePlate
     */
    static async getHistory(req, res) {
        try {
            const { licensePlate } = req.params;

            const plate = sanitizeLicensePlate(licensePlate);
            if (!isValidLicensePlate(plate)) {
                return res.status(400).json({ error: 'Invalid license plate format' });
            }

            const result = await ParkingManagementService.getVehicleHistory(plate);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get parking lot status
     * GET /api/parking/lot-status
     */
    static async getLotStatus(req, res) {
        try {
            const result = await ParkingManagementService.getParkingLotStatus();
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get availability statistics
     * GET /api/parking/availability
     */
    static async getAvailability(req, res) {
        try {
            const stats = await ParkingSpotAllocationService.getAvailabilityStats();
            res.json(stats);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Preview parking fee
     * POST /api/parking/preview-fee
     */
    static async previewFee(req, res) {
        try {
            const { transactionId } = req.body;

            if (!transactionId) {
                return res.status(400).json({ error: 'Transaction ID is required' });
            }

            const result = await FeeCalculationService.previewFee(transactionId);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

/**
 * VehicleController - Handles vehicle management
 */
class VehicleController {
    /**
     * Register a new vehicle
     * POST /api/vehicles
     */
    static async register(req, res) {
        try {
            const { licensePlate, vehicleType, ownerName, ownerContact } = req.body;

            if (!licensePlate || !vehicleType) {
                return res
                    .status(400)
                    .json({ error: 'License plate and vehicle type are required' });
            }

            const plate = sanitizeLicensePlate(licensePlate);
            if (!isValidLicensePlate(plate)) {
                return res.status(400).json({ error: 'Invalid license plate format' });
            }

            // Get vehicle type ID
            const vType = await VehicleType.getByName(vehicleType);
            if (!vType) {
                return res.status(400).json({ error: 'Invalid vehicle type' });
            }

            // Check if vehicle already exists
            const existingVehicle = await Vehicle.getByLicensePlate(plate);
            if (existingVehicle) {
                return res.status(400).json({ error: 'Vehicle already registered' });
            }

            const vehicle = await Vehicle.create(
                plate,
                vType.id,
                ownerName,
                ownerContact
            );

            res.status(201).json({
                success: true,
                vehicle,
                message: 'Vehicle registered successfully',
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get vehicle details
     * GET /api/vehicles/:licensePlate
     */
    static async getVehicle(req, res) {
        try {
            const { licensePlate } = req.params;

            const vehicle = await Vehicle.getByLicensePlate(licensePlate);

            if (!vehicle) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }

            res.json(vehicle);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get all vehicles
     * GET /api/vehicles
     */
    static async getAllVehicles(req, res) {
        try {
            const vehicles = await Vehicle.getAll();
            res.json(vehicles);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get vehicle types
     * GET /api/vehicle-types
     */
    static async getVehicleTypes(req, res) {
        try {
            const types = await VehicleType.getAll();
            res.json(types);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = {
    ParkingController,
    VehicleController,
};
