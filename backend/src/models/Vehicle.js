const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const { sanitizeLicensePlate } = require('../utils/helpers');

class Vehicle {
    /**
     * Create a new vehicle
     */
    static async create(licensePlate, vehicleTypeId, ownerName, ownerContact) {
        const id = uuidv4();
        const normalized = sanitizeLicensePlate(licensePlate);
        const sql = `
            INSERT INTO vehicles (id, license_plate, vehicle_type_id, owner_name, owner_contact)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.run(sql, [id, normalized, vehicleTypeId, ownerName, ownerContact]);
        return this.getById(id);
    }

    /**
     * Get vehicle by ID
     */
    static async getById(id) {
        const sql = `
      SELECT v.*, vt.name as vehicle_type_name, vt.space_required, vt.hourly_rate
      FROM vehicles v
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
      WHERE v.id = ?
    `;
        return db.get(sql, [id]);
    }

    /**
     * Get vehicle by license plate
     */
    static async getByLicensePlate(licensePlate) {
        const normalized = sanitizeLicensePlate(licensePlate);
        const sql = `
            SELECT v.*, vt.name as vehicle_type_name, vt.space_required, vt.hourly_rate
            FROM vehicles v
            LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
            WHERE v.license_plate = ?
        `;
        return db.get(sql, [normalized]);
    }

    /**
     * Get all vehicles
     */
    static async getAll() {
        const sql = `
      SELECT v.*, vt.name as vehicle_type_name, vt.space_required, vt.hourly_rate
      FROM vehicles v
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
      ORDER BY v.created_at DESC
    `;
        return db.all(sql);
    }

    /**
     * Update vehicle
     */
    static async update(id, ownerName, ownerContact) {
        const sql = `UPDATE vehicles SET owner_name = ?, owner_contact = ? WHERE id = ?`;
        await db.run(sql, [ownerName, ownerContact, id]);
        return this.getById(id);
    }

    /**
     * Delete vehicle
     */
    static async delete(id) {
        const sql = `DELETE FROM vehicles WHERE id = ?`;
        return db.run(sql, [id]);
    }
}

module.exports = Vehicle;
