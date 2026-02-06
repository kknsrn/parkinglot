const ParkingSpace = require('../models/ParkingSpace');
const ParkingTransaction = require('../models/ParkingTransaction');
const Vehicle = require('../models/Vehicle');
const VehicleType = require('../models/VehicleType');
const db = require('../database/connection');

/**
 * ParkingSpotAllocationService - Handles the allocation of parking spots
 * Uses a strategy pattern with first-fit algorithm for optimal space allocation
 */
class ParkingSpotAllocationService {
    /**
     * Allocate parking spot for a vehicle
     * Algorithm: First-fit - finds the first available spot with sufficient capacity
     * Time Complexity: O(n) where n is number of parking spaces
     * This is optimal as we need to check availability anyway
     */
    static async allocateParkingSpot(vehicleId) {
        try {
            // Get vehicle details including space requirements
            const vehicle = await Vehicle.getById(vehicleId);
            if (!vehicle) {
                throw new Error('Vehicle not found');
            }

            // Check if vehicle already has an active parking
            const activeParking = await ParkingTransaction.getActiveByVehicleId(vehicleId);
            if (activeParking) {
                throw new Error('Vehicle already has an active parking spot');
            }

            // Get available space with first-fit algorithm
            const availableSpace = await ParkingSpace.getAvailableByCapacity(vehicle.space_required);

            if (!availableSpace) {
                throw new Error('No available parking space for this vehicle');
            }

            // Occupy the space
            await ParkingSpace.occupy(availableSpace.id);

            // Create parking transaction
            const transaction = await ParkingTransaction.create(
                vehicleId,
                availableSpace.id,
                availableSpace.floor_id
            );

            return {
                success: true,
                transactionId: transaction.id,
                parkingSpace: {
                    id: availableSpace.id,
                    floorNumber: availableSpace.floor_number,
                    spaceNumber: availableSpace.space_number,
                },
                message: `Vehicle parked at Floor ${availableSpace.floor_number}, Space ${availableSpace.space_number}`,
            };
        } catch (error) {
            throw new Error(`Parking allocation failed: ${error.message}`);
        }
    }

    /**
     * Get next available parking space (for preview)
     */
    static async getNextAvailableSpace(requiredCapacity) {
        try {
            const availableSpace = await ParkingSpace.getAvailableByCapacity(requiredCapacity);

            if (!availableSpace) {
                return null;
            }

            return {
                id: availableSpace.id,
                floorNumber: availableSpace.floor_number,
                spaceNumber: availableSpace.space_number,
            };
        } catch (error) {
            throw new Error(`Failed to get available space: ${error.message}`);
        }
    }

    /**
     * Get parking lot capacity status
     */
    static async getParkingLotStatus() {
        try {
            const status = await ParkingSpace.getParkingLotStatus();
            return status;
        } catch (error) {
            throw new Error(`Failed to get parking lot status: ${error.message}`);
        }
    }

    /**
     * Get availability statistics
     */
    static async getAvailabilityStats() {
        try {
            const stats = await ParkingSpace.getAvailabilityStats();
            return {
                totalSpaces: stats.total_spaces,
                availableSpaces: stats.available_spaces,
                occupiedSpaces: stats.occupied_spaces,
                occupancyRate: ((stats.occupied_spaces / stats.total_spaces) * 100).toFixed(2),
            };
        } catch (error) {
            throw new Error(`Failed to get availability stats: ${error.message}`);
        }
    }
}

module.exports = ParkingSpotAllocationService;
