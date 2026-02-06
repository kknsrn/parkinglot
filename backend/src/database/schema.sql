-- Parking Lot Schema

-- Vehicle types table
CREATE TABLE IF NOT EXISTS vehicle_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  space_required INTEGER NOT NULL,
  hourly_rate REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Parking floors table
CREATE TABLE IF NOT EXISTS parking_floors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  floor_number INTEGER NOT NULL UNIQUE,
  total_spaces INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Parking spaces table
CREATE TABLE IF NOT EXISTS parking_spaces (
  id TEXT PRIMARY KEY,
  floor_id INTEGER NOT NULL,
  space_number INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (floor_id) REFERENCES parking_floors(id),
  UNIQUE(floor_id, space_number)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  license_plate TEXT NOT NULL UNIQUE,
  vehicle_type_id INTEGER NOT NULL,
  owner_name TEXT,
  owner_contact TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

-- Parking transactions table
CREATE TABLE IF NOT EXISTS parking_transactions (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  parking_space_id TEXT,
  floor_id INTEGER,
  entry_time DATETIME NOT NULL,
  exit_time DATETIME,
  duration_minutes INTEGER,
  fee_amount REAL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id),
  FOREIGN KEY (floor_id) REFERENCES parking_floors(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_parking_spaces_floor_available 
  ON parking_spaces(floor_id, is_available);

CREATE INDEX IF NOT EXISTS idx_parking_transactions_vehicle 
  ON parking_transactions(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_parking_transactions_status 
  ON parking_transactions(status);

CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate 
  ON vehicles(license_plate);

-- Insert default vehicle types
INSERT OR IGNORE INTO vehicle_types (id, name, space_required, hourly_rate) VALUES 
  (1, 'motorcycle', 1, 1.5),
  (2, 'car', 1, 3.0),
  (3, 'suv', 2, 4.5),
  (4, 'bus', 3, 6.0);

-- Insert default parking floors and spaces
INSERT OR IGNORE INTO parking_floors (id, floor_number, total_spaces) VALUES 
  (1, 1, 20),
  (2, 2, 20),
  (3, 3, 20);
