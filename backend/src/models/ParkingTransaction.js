const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class ParkingTransaction {
    /**
     * Create a new parking transaction (check-in)
     */
    static async create(vehicleId, parkingSpaceId, floorId) {
        const id = uuidv4();
        const entryTime = new Date().toISOString();
        const sql = `
      INSERT INTO parking_transactions (id, vehicle_id, parking_space_id, floor_id, entry_time, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `;
        await db.run(sql, [id, vehicleId, parkingSpaceId, floorId, entryTime]);
        return this.getById(id);
    }

    /**
     * Get transaction by ID
     */
    static async getById(id) {
        const sql = `
      SELECT pt.*, v.license_plate, ps.space_number, pf.floor_number
      FROM parking_transactions pt
      LEFT JOIN vehicles v ON pt.vehicle_id = v.id
      LEFT JOIN parking_spaces ps ON pt.parking_space_id = ps.id
      LEFT JOIN parking_floors pf ON pt.floor_id = pf.id
      WHERE pt.id = ?
    `;
        return db.get(sql, [id]);
    }

    /**
     * Get active transaction for a vehicle
     */
    static async getActiveByVehicleId(vehicleId) {
        const sql = `
      SELECT pt.*, v.license_plate, vt.hourly_rate, ps.space_number, pf.floor_number
      FROM parking_transactions pt
      LEFT JOIN vehicles v ON pt.vehicle_id = v.id
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
      LEFT JOIN parking_spaces ps ON pt.parking_space_id = ps.id
      LEFT JOIN parking_floors pf ON pt.floor_id = pf.id
      WHERE pt.vehicle_id = ? AND pt.status = 'active'
      LIMIT 1
    `;
        return db.get(sql, [vehicleId]);
    }

    /**
     * Get all active transactions
     */
    static async getAll(status = 'all') {
        let sql = `
      SELECT pt.*, v.license_plate, vt.name as vehicle_type_name, ps.space_number, pf.floor_number
      FROM parking_transactions pt
      LEFT JOIN vehicles v ON pt.vehicle_id = v.id
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
      LEFT JOIN parking_spaces ps ON pt.parking_space_id = ps.id
      LEFT JOIN parking_floors pf ON pt.floor_id = pf.id
    `;

        if (status !== 'all') {
            sql += ` WHERE pt.status = '${status}'`;
        }

        sql += ` ORDER BY pt.entry_time DESC`;
        return db.all(sql);
    }

    /**
     * Check-out: End parking transaction and calculate fee
     */
    static async checkout(transactionId, feeAmount) {
        const exitTime = new Date().toISOString();
        const entryData = await this.getById(transactionId);

        if (!entryData) {
            throw new Error('Transaction not found');
        }

        const entryDate = new Date(entryData.entry_time);
        const exitDate = new Date(exitTime);
        const durationMinutes = Math.ceil((exitDate - entryDate) / (1000 * 60));

        const sql = `
      UPDATE parking_transactions 
      SET exit_time = ?, duration_minutes = ?, fee_amount = ?, status = 'completed'
      WHERE id = ?
    `;

        await db.run(sql, [exitTime, durationMinutes, feeAmount, transactionId]);
        return this.getById(transactionId);
    }

    /**
     * Get transaction history
     */
    static async getHistory(vehicleId) {
        const sql = `
      SELECT pt.*, v.license_plate, ps.space_number, pf.floor_number
      FROM parking_transactions pt
      LEFT JOIN vehicles v ON pt.vehicle_id = v.id
      LEFT JOIN parking_spaces ps ON pt.parking_space_id = ps.id
      LEFT JOIN parking_floors pf ON pt.floor_id = pf.id
      WHERE pt.vehicle_id = ? AND pt.status = 'completed'
      ORDER BY pt.entry_time DESC
    `;
        return db.all(sql, [vehicleId]);
    }

    /**
     * Get parking statistics
     */
    static async getStatistics() {
        const stats = await db.get(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_vehicles,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fee_amount ELSE 0 END), 0) as total_revenue
      FROM parking_transactions
    `);
        return stats;
    }
}

module.exports = ParkingTransaction;
