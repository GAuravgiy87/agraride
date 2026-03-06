import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('agraride.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    phone TEXT,
    gender TEXT,
    vehicle_type TEXT
  );

  CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_seat REAL NOT NULL,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (driver_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    passenger_id INTEGER,
    seats_booked INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (passenger_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    latitude REAL,
    longitude REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    rater_id INTEGER,
    rated_user_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (rater_id) REFERENCES users (id),
    FOREIGN KEY (rated_user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS sos_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    user_id INTEGER,
    status TEXT DEFAULT 'active',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Add columns if they don't exist (for existing databases)
try { db.exec("ALTER TABLE users ADD COLUMN gender TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN vehicle_type TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'pending';"); } catch (e) {}
try { db.exec("ALTER TABLE bookings ADD COLUMN counter_offer_price REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE locations ADD COLUMN user_id INTEGER;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN origin_lat REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN origin_lng REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN dest_lat REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN dest_lng REAL;"); } catch (e) {}

// Seed Admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@agraride.com');
if (!adminExists) {
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'System Admin',
    'admin@agraride.com',
    'admin', // In a real app, this would be hashed
    'admin'
  );
}

export default db;
