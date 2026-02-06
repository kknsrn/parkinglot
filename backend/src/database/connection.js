const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './parking_lot.db';

class DatabaseConnection {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize the database connection
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Database connection error:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createSchema();
                    resolve();
                }
            });
        });
    }

    /**
     * Create database schema
     */
    createSchema() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        this.db.exec(schema, (err) => {
            if (err) {
                console.error('Schema creation error:', err);
            } else {
                console.log('Database schema initialized');
            }
        });
    }

    /**
     * Run a query (for INSERT, UPDATE, DELETE)
     */
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    /**
     * Get a single row
     */
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get all rows
     */
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Close the database connection
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = new DatabaseConnection();
