const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class ParkingSpace {
    /**
     * Create a new parking space
     */
    static async create(floorId, spaceNumber, capacity) {
        const id = uuidv4();
        const sql = `
      INSERT INTO parking_spaces (id, floor_id, space_number, capacity, is_available)
      VALUES (?, ?, ?, ?, 1)
    `;
        await db.run(sql, [id, floorId, spaceNumber, capacity]);
        return this.getById(id);
    }

    /**
     * Get space by ID
     */
    static async getById(id) {
        const sql = `
      SELECT ps.*, pf.floor_number
      FROM parking_spaces ps
      LEFT JOIN parking_floors pf ON ps.floor_id = pf.id
      WHERE ps.id = ?
    `;
        return db.get(sql, [id]);
    }

    /**
     * Get all spaces for a floor
     */
    static async getByFloorId(floorId) {
        const sql = `
      SELECT ps.*, pf.floor_number
      FROM parking_spaces ps
      LEFT JOIN parking_floors pf ON ps.floor_id = pf.id
      WHERE ps.floor_id = ?
      ORDER BY ps.space_number
    `;
        return db.all(sql, [floorId]);
    }

    /**
     * Get all available spaces for a specific capacity
     */
    static async getAvailableByCapacity(requiredCapacity) {
        const sql = `
      SELECT ps.*, pf.floor_number
      FROM parking_spaces ps
      LEFT JOIN parking_floors pf ON ps.floor_id = pf.id
      WHERE ps.is_available = 1 AND ps.capacity >= ?
      ORDER BY pf.floor_number ASC, ps.space_number ASC
      LIMIT 1
    `;
        return db.get(sql, [requiredCapacity]);
    }

    /**
     * Get all spaces
     */
    static async getAll() {
        const sql = `
      SELECT ps.*, pf.floor_number
      FROM parking_spaces ps
      LEFT JOIN parking_floors pf ON ps.floor_id = pf.id
      ORDER BY pf.floor_number, ps.space_number
    `;
        return db.all(sql);
    }

    /**
     * Occupy a parking space
     */
    static async occupy(id) {
        const sql = `UPDATE parking_spaces SET is_available = 0 WHERE id = ?`;
        await db.run(sql, [id]);
        return this.getById(id);
    }

    /**
     * Release a parking space
     */
    static async release(id) {
        const sql = `UPDATE parking_spaces SET is_available = 1 WHERE id = ?`;
        await db.run(sql, [id]);
        return this.getById(id);
    }

    /**
     * Get parking lot status
     */
    static async getParkingLotStatus() {
        const spaces = await db.all(`
      SELECT 
        pf.floor_number,
        COUNT(*) as total_spaces,
        SUM(CASE WHEN ps.is_available = 1 THEN 1 ELSE 0 END) as available_spaces,
        SUM(CASE WHEN ps.is_available = 0 THEN 1 ELSE 0 END) as occupied_spaces
      FROM parking_spaces ps
      LEFT JOIN parking_floors pf ON ps.floor_id = pf.id
      GROUP BY pf.floor_number
      ORDER BY pf.floor_number
    `);
        return spaces;
    }

    /**
     * Get total availability stats
     */
    static async getAvailabilityStats() {
        const stats = await db.get(`
      SELECT 
        COUNT(*) as total_spaces,
        SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) as available_spaces,
        SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) as occupied_spaces
      FROM parking_spaces
    `);
        return stats;
    }
}

module.exports = ParkingSpace;
