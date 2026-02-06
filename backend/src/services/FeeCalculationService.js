const ParkingTransaction = require('../models/ParkingTransaction');
const ParkingSpace = require('../models/ParkingSpace');
const VehicleType = require('../models/VehicleType');

/**
 * FeeCalculationService - Handles parking fee calculations
 * Supports multiple pricing strategies: hourly rate, daily rate, etc.
 */
class FeeCalculationService {
    /**
     * Calculate parking fee based on duration and vehicle type
     * Pricing Model:
     * - Base hourly rate depends on vehicle type
     * - Minimum charge applies even for partial hours
     * - Daily caps prevent excessive charges
     */
    static async calculateFee(transactionId) {
        try {
            const transaction = await ParkingTransaction.getById(transactionId);

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            if (!transaction.exit_time) {
                throw new Error('Vehicle has not exited yet');
            }

            // Calculate duration in hours
            const entryDate = new Date(transaction.entry_time);
            const exitDate = new Date(transaction.exit_time);
            const durationMinutes = Math.ceil((exitDate - entryDate) / (1000 * 60));
            const durationHours = Math.ceil(durationMinutes / 60);

            // Get vehicle type hourly rate
            const vehicleType = await VehicleType.getById(transaction.vehicle_type_id);
            const hourlyRate = vehicleType?.hourly_rate || 3.0;

            // Calculate fee with minimum charge (1 hour)
            const minimumCharge = 1 * hourlyRate;
            const calculatedFee = Math.max(minimumCharge, durationHours * hourlyRate);

            // Apply daily cap if duration exceeds 24 hours
            const dailyCap = 24 * hourlyRate;
            const finalFee = durationHours > 24 ? dailyCap : calculatedFee;

            return {
                durationMinutes,
                durationHours,
                hourlyRate,
                calculatedFee: parseFloat(calculatedFee.toFixed(2)),
                finalFee: parseFloat(finalFee.toFixed(2)),
                isDailyCapped: durationHours > 24,
            };
        } catch (error) {
            throw new Error(`Fee calculation failed: ${error.message}`);
        }
    }

    /**
     * Preview fee without checkout
     */
    static async previewFee(transactionId) {
        try {
            const transaction = await ParkingTransaction.getById(transactionId);

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            const entryDate = new Date(transaction.entry_time);
            const nowDate = new Date();
            const durationMinutes = Math.ceil((nowDate - entryDate) / (1000 * 60));
            const durationHours = Math.ceil(durationMinutes / 60);

            const vehicleType = await VehicleType.getById(transaction.vehicle_type_id);
            const hourlyRate = vehicleType?.hourly_rate || 3.0;

            const minimumCharge = 1 * hourlyRate;
            const previewFee = Math.max(minimumCharge, durationHours * hourlyRate);

            return {
                durationMinutes,
                durationHours,
                hourlyRate,
                estimatedFee: parseFloat(previewFee.toFixed(2)),
            };
        } catch (error) {
            throw new Error(`Fee preview failed: ${error.message}`);
        }
    }

    /**
     * Get revenue statistics
     */
    static async getRevenueStats() {
        try {
            const stats = await ParkingTransaction.getStatistics();

            return {
                totalTransactions: stats.total_transactions,
                activeVehicles: stats.active_vehicles,
                completedVehicles: stats.completed_vehicles,
                totalRevenue: parseFloat(stats.total_revenue.toFixed(2)),
                averageFeePerVehicle: stats.completed_vehicles > 0
                    ? parseFloat((stats.total_revenue / stats.completed_vehicles).toFixed(2))
                    : 0,
            };
        } catch (error) {
            throw new Error(`Revenue stats calculation failed: ${error.message}`);
        }
    }

    /**
     * Apply promotional discount (future feature)
     */
    static applyDiscount(fee, discountPercentage) {
        const discount = (fee * discountPercentage) / 100;
        return parseFloat((fee - discount).toFixed(2));
    }
}

module.exports = FeeCalculationService;
