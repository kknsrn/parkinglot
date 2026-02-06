const ParkingTransaction = require('../models/ParkingTransaction');
const ParkingSpace = require('../models/ParkingSpace');
const Vehicle = require('../models/Vehicle');
const ParkingSpotAllocationService = require('./ParkingSpotAllocationService');
const FeeCalculationService = require('./FeeCalculationService');

/**
 * ParkingManagementService - Coordinates high-level parking operations
 * Acts as a facade for complex parking workflows
 */
class ParkingManagementService {
    /**
     * Vehicle Check-In Process
     * 1. Verify vehicle exists
     * 2. Allocate parking spot
     * 3. Record check-in time
     * 4. Update space availability
     */
    static async checkIn(licensePlate) {
        try {
            // Verify vehicle exists
            const vehicle = await Vehicle.getByLicensePlate(licensePlate);

            if (!vehicle) {
                throw new Error(`Vehicle with license plate ${licensePlate} not found`);
            }

            // Check if vehicle is already parked
            const existingParking = await ParkingTransaction.getActiveByVehicleId(vehicle.id);
            if (existingParking) {
                throw new Error(
                    `Vehicle already parked at Floor ${existingParking.floor_number}, Space ${existingParking.space_number}`
                );
            }

            // Allocate parking spot
            const allocation = await ParkingSpotAllocationService.allocateParkingSpot(vehicle.id);

            return {
                success: true,
                transactionId: allocation.transactionId,
                vehicle: {
                    id: vehicle.id,
                    licensePlate: vehicle.license_plate,
                    type: vehicle.vehicle_type_name,
                },
                parkingSpace: allocation.parkingSpace,
                checkInTime: new Date().toISOString(),
                message: allocation.message,
            };
        } catch (error) {
            throw new Error(`Check-in failed: ${error.message}`);
        }
    }

    /**
     * Vehicle Check-Out Process
     * 1. Find active transaction
     * 2. Calculate parking fee
     * 3. Release parking space
     * 4. Record check-out time
     * 5. Update transaction status
     */
    static async checkOut(licensePlate) {
        try {
            // Get vehicle
            const vehicle = await Vehicle.getByLicensePlate(licensePlate);

            if (!vehicle) {
                throw new Error(`Vehicle with license plate ${licensePlate} not found`);
            }

            // Get active parking transaction
            const transaction = await ParkingTransaction.getActiveByVehicleId(vehicle.id);

            if (!transaction) {
                throw new Error('No active parking found for this vehicle');
            }

            // Calculate fee
            const feeDetails = await FeeCalculationService.calculateFee(transaction.id);

            // Release parking space
            await ParkingSpace.release(transaction.parking_space_id);

            // Record checkout
            const updatedTransaction = await ParkingTransaction.checkout(
                transaction.id,
                feeDetails.finalFee
            );

            return {
                success: true,
                vehicle: {
                    id: vehicle.id,
                    licensePlate: vehicle.license_plate,
                    type: vehicle.vehicle_type_name,
                },
                parkingDetails: {
                    floor: transaction.floor_number,
                    space: transaction.space_number,
                    checkInTime: transaction.entry_time,
                    checkOutTime: updatedTransaction.exit_time,
                },
                feeDetails: {
                    durationMinutes: updatedTransaction.duration_minutes,
                    hourlyRate: feeDetails.hourlyRate,
                    calculatedFee: feeDetails.calculatedFee,
                    finalFee: feeDetails.finalFee,
                    isDailyCapped: feeDetails.isDailyCapped,
                },
                message: `Check-out successful. Total fee: $${feeDetails.finalFee}`,
            };
        } catch (error) {
            throw new Error(`Check-out failed: ${error.message}`);
        }
    }

    /**
     * Get current parking status for a vehicle
     */
    static async getVehicleStatus(licensePlate) {
        try {
            const vehicle = await Vehicle.getByLicensePlate(licensePlate);

            if (!vehicle) {
                throw new Error(`Vehicle not found`);
            }

            const activeTransaction = await ParkingTransaction.getActiveByVehicleId(vehicle.id);

            if (!activeTransaction) {
                return {
                    vehicle: {
                        licensePlate: vehicle.license_plate,
                        type: vehicle.vehicle_type_name,
                    },
                    status: 'not_parked',
                };
            }

            // Get fee preview
            const feePreview = await FeeCalculationService.previewFee(activeTransaction.id);

            return {
                vehicle: {
                    licensePlate: vehicle.license_plate,
                    type: vehicle.vehicle_type_name,
                },
                status: 'parked',
                parkingDetails: {
                    transactionId: activeTransaction.id,
                    floor: activeTransaction.floor_number,
                    space: activeTransaction.space_number,
                    checkInTime: activeTransaction.entry_time,
                },
                feePreview: {
                    durationMinutes: feePreview.durationMinutes,
                    durationHours: feePreview.durationHours,
                    estimatedFee: feePreview.estimatedFee,
                },
            };
        } catch (error) {
            throw new Error(`Status check failed: ${error.message}`);
        }
    }

    /**
     * Get parking lot status
     */
    static async getParkingLotStatus() {
        try {
            const stats = await ParkingSpotAllocationService.getAvailabilityStats();
            const floorStatus = await ParkingSpotAllocationService.getParkingLotStatus();
            const revenueStats = await FeeCalculationService.getRevenueStats();

            return {
                overview: stats,
                floorStatus,
                revenue: revenueStats,
            };
        } catch (error) {
            throw new Error(`Failed to get parking lot status: ${error.message}`);
        }
    }

    /**
     * Get vehicle history
     */
    static async getVehicleHistory(licensePlate) {
        try {
            const vehicle = await Vehicle.getByLicensePlate(licensePlate);

            if (!vehicle) {
                throw new Error(`Vehicle not found`);
            }

            const history = await ParkingTransaction.getHistory(vehicle.id);

            return {
                vehicle: {
                    licensePlate: vehicle.license_plate,
                    type: vehicle.vehicle_type_name,
                },
                history: history.map((h) => ({
                    transactionId: h.id,
                    floor: h.floor_number,
                    space: h.space_number,
                    checkInTime: h.entry_time,
                    checkOutTime: h.exit_time,
                    duration: `${Math.floor(h.duration_minutes / 60)}h ${h.duration_minutes % 60}m`,
                    fee: `$${h.fee_amount.toFixed(2)}`,
                })),
            };
        } catch (error) {
            throw new Error(`History retrieval failed: ${error.message}`);
        }
    }
}

module.exports = ParkingManagementService;
