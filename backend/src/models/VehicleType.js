const db = require('../database/connection');

class VehicleType {
    /**
     * Get all vehicle types
     */
    static async getAll() {
        const sql = `SELECT * FROM vehicle_types ORDER BY id`;
        return db.all(sql);
    }

    /**
     * Get vehicle type by ID
     */
    static async getById(id) {
        const sql = `SELECT * FROM vehicle_types WHERE id = ?`;
        return db.get(sql, [id]);
    }

    /**
     * Get vehicle type by name
     */
    static async getByName(name) {
        const sql = `SELECT * FROM vehicle_types WHERE name = ?`;
        return db.get(sql, [name]);
    }
}

module.exports = VehicleType;
