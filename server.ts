import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post("/api/register", (req, res) => {
    const { name, email, password, phone, gender, vehicle_type } = req.body;
    try {
      const result = db.prepare('INSERT INTO users (name, email, password, phone, gender, vehicle_type) VALUES (?, ?, ?, ?, ?, ?)').run(name, email, password, phone, gender, vehicle_type);
      res.json({ id: result.lastInsertRowid, name, email, role: 'user', gender, vehicle_type });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, gender: user.gender, vehicle_type: user.vehicle_type });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Rides
  app.get("/api/rides", (req, res) => {
    const rides = db.prepare(`
      SELECT r.*, u.name as driver_name, u.gender as driver_gender, u.vehicle_type as driver_vehicle, u.phone as driver_phone
      FROM rides r 
      JOIN users u ON r.driver_id = u.id 
      WHERE r.status = 'active'
      ORDER BY r.departure_time ASC
    `).all();
    res.json(rides);
  });

  app.post("/api/rides/complete/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("UPDATE rides SET status = 'completed' WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/rides/driver/:driverId", (req, res) => {
    const { driverId } = req.params;
    const rides = db.prepare(`
      SELECT * FROM rides WHERE driver_id = ? ORDER BY departure_time DESC
    `).all(driverId);
    res.json(rides);
  });

  app.post("/api/rides", (req, res) => {
    const { driver_id, origin, destination, departure_time, available_seats, price_per_seat, origin_lat, origin_lng, dest_lat, dest_lng } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO rides (driver_id, origin, destination, departure_time, available_seats, price_per_seat, origin_lat, origin_lng, dest_lat, dest_lng) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(driver_id, origin, destination, departure_time, available_seats, price_per_seat, origin_lat, origin_lng, dest_lat, dest_lng);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/rides/:id", (req, res) => {
    const { id } = req.params;
    const { origin, destination, departure_time, available_seats, price_per_seat, origin_lat, origin_lng, dest_lat, dest_lng } = req.body;
    try {
      db.prepare(`
        UPDATE rides 
        SET origin = ?, destination = ?, departure_time = ?, available_seats = ?, price_per_seat = ?, origin_lat = ?, origin_lng = ?, dest_lat = ?, dest_lng = ?
        WHERE id = ?
      `).run(origin, destination, departure_time, available_seats, price_per_seat, origin_lat, origin_lng, dest_lat, dest_lng, id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/rides/:id", (req, res) => {
    const { id } = req.params;
    try {
      // Delete all related records first (cascade delete)
      db.prepare("DELETE FROM bookings WHERE ride_id = ?").run(id);
      db.prepare("DELETE FROM locations WHERE ride_id = ?").run(id);
      db.prepare("DELETE FROM messages WHERE ride_id = ?").run(id);
      db.prepare("DELETE FROM ratings WHERE ride_id = ?").run(id);
      db.prepare("DELETE FROM sos_alerts WHERE ride_id = ?").run(id);
      // Finally delete the ride
      db.prepare("DELETE FROM rides WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (e: any) {
      console.error('Delete ride error:', e);
      res.status(400).json({ error: e.message });
    }
  });

  // Bookings
  app.post("/api/bookings", (req, res) => {
    const { ride_id, passenger_id, seats_booked, counter_offer_price } = req.body;
    try {
      // Check if user already has a pending or confirmed booking for this ride
      const existingBooking = db.prepare("SELECT * FROM bookings WHERE ride_id = ? AND passenger_id = ? AND status IN ('pending', 'confirmed')").get(ride_id, passenger_id) as any;
      if (existingBooking) {
        return res.status(400).json({ error: "You have already requested or booked this ride" });
      }

      const ride = db.prepare('SELECT available_seats FROM rides WHERE id = ?').get(ride_id) as any;
      if (ride.available_seats < seats_booked) {
        return res.status(400).json({ error: "Not enough seats available" });
      }

      db.prepare('INSERT INTO bookings (ride_id, passenger_id, seats_booked, status, counter_offer_price) VALUES (?, ?, ?, ?, ?)').run(ride_id, passenger_id, seats_booked, 'pending', counter_offer_price || null);
      res.json({ success: true, message: counter_offer_price ? "Counter offer sent to driver" : "Booking request sent to driver" });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/bookings/accept/:id", (req, res) => {
    const { id } = req.params;
    try {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").run(id);
      db.prepare('UPDATE rides SET available_seats = available_seats - ? WHERE id = ?').run(booking.seats_booked, booking.ride_id);
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/bookings/reject/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("UPDATE bookings SET status = 'rejected' WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/bookings/driver/:driverId", (req, res) => {
    const { driverId } = req.params;
    const bookings = db.prepare(`
      SELECT b.*, r.origin, r.destination, r.departure_time, r.price_per_seat, u.name as passenger_name, u.phone as passenger_phone, u.gender as passenger_gender
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      JOIN users u ON b.passenger_id = u.id
      WHERE r.driver_id = ? AND b.status = 'pending'
      ORDER BY b.id DESC
    `).all(driverId);
    res.json(bookings);
  });

  app.get("/api/bookings/passenger/:passengerId", (req, res) => {
    const { passengerId } = req.params;
    const bookings = db.prepare(`
      SELECT b.*, r.origin, r.destination, r.departure_time, r.status as ride_status, r.driver_id, u.name as driver_name
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      JOIN users u ON r.driver_id = u.id
      WHERE b.passenger_id = ?
      ORDER BY r.departure_time DESC
    `).all(passengerId);
    res.json(bookings);
  });

  app.get("/api/bookings/check/:rideId/:passengerId", (req, res) => {
    const { rideId, passengerId } = req.params;
    const booking = db.prepare('SELECT * FROM bookings WHERE ride_id = ? AND passenger_id = ?').get(rideId, passengerId);
    res.json({ hasBooked: !!booking, booking });
  });

  // Admin Stats
  app.get("/api/admin/stats", (req, res) => {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const rideCount = db.prepare('SELECT COUNT(*) as count FROM rides').get() as any;
    const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as any;
    const recentRides = db.prepare('SELECT r.*, u.name as driver_name FROM rides r JOIN users u ON r.driver_id = u.id ORDER BY r.id DESC LIMIT 10').all();
    
    const detailedBookings = db.prepare(`
      SELECT 
        b.id, 
        b.seats_booked, 
        p.name as passenger_name, 
        d.name as driver_name, 
        r.origin, 
        r.destination, 
        r.status as ride_status,
        r.id as ride_id
      FROM bookings b
      JOIN users p ON b.passenger_id = p.id
      JOIN rides r ON b.ride_id = r.id
      JOIN users d ON r.driver_id = d.id
      ORDER BY b.id DESC
    `).all();

    const activeSOS = db.prepare(`
      SELECT 
        s.*, 
        u.name as user_name, 
        r.origin, 
        r.destination,
        r.driver_id,
        (SELECT name FROM users WHERE id = r.driver_id) as driver_name,
        (SELECT GROUP_CONCAT(users.name) FROM bookings JOIN users ON bookings.passenger_id = users.id WHERE bookings.ride_id = r.id) as passengers
      FROM sos_alerts s
      JOIN users u ON s.user_id = u.id
      JOIN rides r ON s.ride_id = r.id
      WHERE s.status = 'active'
    `).all();
    
    res.json({
      users: userCount.count,
      rides: rideCount.count,
      bookings: bookingCount.count,
      recentRides,
      detailedBookings,
      activeSOS
    });
  });

  // Admin - Get all rides with driver details
  app.get("/api/admin/rides", (req, res) => {
    const rides = db.prepare(`
      SELECT r.*, u.name as driver_name, u.phone as driver_phone, u.gender as driver_gender
      FROM rides r 
      JOIN users u ON r.driver_id = u.id 
      ORDER BY r.id DESC
    `).all();
    res.json(rides);
  });

  // Admin - Get all users
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare('SELECT id, name, email, phone, gender, vehicle_type, role FROM users ORDER BY id DESC').all();
    res.json(users);
  });

  // Admin - Delete user
  app.delete("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    try {
      // First, get all rides by this user
      const userRides = db.prepare('SELECT id FROM rides WHERE driver_id = ?').all(id) as any[];
      
      // Delete all data related to user's rides
      for (const ride of userRides) {
        db.prepare('DELETE FROM bookings WHERE ride_id = ?').run(ride.id);
        db.prepare('DELETE FROM locations WHERE ride_id = ?').run(ride.id);
        db.prepare('DELETE FROM messages WHERE ride_id = ?').run(ride.id);
        db.prepare('DELETE FROM ratings WHERE ride_id = ?').run(ride.id);
        db.prepare('DELETE FROM sos_alerts WHERE ride_id = ?').run(ride.id);
      }
      
      // Delete user's rides
      db.prepare('DELETE FROM rides WHERE driver_id = ?').run(id);
      
      // Delete user's bookings (as passenger)
      db.prepare('DELETE FROM bookings WHERE passenger_id = ?').run(id);
      
      // Delete user's locations
      db.prepare('DELETE FROM locations WHERE user_id = ?').run(id);
      
      // Delete user's messages
      db.prepare('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?').run(id, id);
      
      // Delete user's ratings
      db.prepare('DELETE FROM ratings WHERE rater_id = ? OR rated_user_id = ?').run(id, id);
      
      // Delete user's SOS alerts
      db.prepare('DELETE FROM sos_alerts WHERE user_id = ?').run(id);
      
      // Finally delete the user
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      
      res.json({ success: true });
    } catch (e: any) {
      console.error('Delete user error:', e);
      res.status(400).json({ error: e.message });
    }
  });

  // Admin - Update user role
  app.put("/api/admin/users/:id/role", (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // SOS API
  app.post("/api/sos", (req, res) => {
    const { ride_id, user_id } = req.body;
    try {
      db.prepare('INSERT INTO sos_alerts (ride_id, user_id) VALUES (?, ?)').run(ride_id, user_id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/sos/resolve/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("UPDATE sos_alerts SET status = 'resolved' WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Chat API
  app.get("/api/messages/:rideId", (req, res) => {
    const { rideId } = req.params;
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.ride_id = ? 
      ORDER BY m.timestamp ASC
    `).all(rideId);
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { ride_id, sender_id, receiver_id, content } = req.body;
    try {
      db.prepare(`
        INSERT INTO messages (ride_id, sender_id, receiver_id, content) 
        VALUES (?, ?, ?, ?)
      `).run(ride_id, sender_id, receiver_id, content);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/inbox/:userId", (req, res) => {
    const { userId } = req.params;
    const chats = db.prepare(`
      SELECT DISTINCT 
        m.ride_id, 
        r.origin, 
        r.destination,
        u.name as other_party_name,
        u.id as other_party_id
      FROM messages m
      JOIN rides r ON m.ride_id = r.id
      JOIN users u ON (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) = u.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
    `).all(userId, userId, userId);
    res.json(chats);
  });

  // Ratings API
  app.post("/api/ratings", (req, res) => {
    const { ride_id, rater_id, rated_user_id, rating, comment } = req.body;
    try {
      db.prepare(`
        INSERT INTO ratings (ride_id, rater_id, rated_user_id, rating, comment) 
        VALUES (?, ?, ?, ?, ?)
      `).run(ride_id, rater_id, rated_user_id, rating, comment);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/ratings/:userId", (req, res) => {
    const { userId } = req.params;
    const ratings = db.prepare(`
      SELECT r.*, u.name as rater_name 
      FROM ratings r 
      JOIN users u ON r.rater_id = u.id 
      WHERE r.rated_user_id = ?
    `).all(userId);
    
    const avgRating = db.prepare('SELECT AVG(rating) as avg FROM ratings WHERE rated_user_id = ?').get(userId) as any;
    
    res.json({ ratings, average: avgRating.avg || 0 });
  });

  // Location API
  app.post("/api/locations", (req, res) => {
    const { ride_id, user_id, latitude, longitude } = req.body;
    try {
      const existing = db.prepare('SELECT id FROM locations WHERE ride_id = ? AND user_id = ?').get(ride_id, user_id);
      if (existing) {
        db.prepare('UPDATE locations SET latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP WHERE ride_id = ? AND user_id = ?')
          .run(latitude, longitude, ride_id, user_id);
      } else {
        db.prepare('INSERT INTO locations (ride_id, user_id, latitude, longitude) VALUES (?, ?, ?, ?)')
          .run(ride_id, user_id, latitude, longitude);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/locations/:rideId", (req, res) => {
    const { rideId } = req.params;
    const locations = db.prepare(`
      SELECT l.*, u.name as user_name, u.id as user_id
      FROM locations l
      JOIN users u ON l.user_id = u.id
      WHERE l.ride_id = ?
    `).all(rideId);
    res.json(locations);
  });

  // Admin DB Management
  app.get("/api/admin/db/tables", (req, res) => {
    try {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
      res.json(tables);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/db/table/:tableName", (req, res) => {
    const { tableName } = req.params;
    try {
      const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/db/query", (req, res) => {
    const { query } = req.body;
    try {
      const stmt = db.prepare(query);
      if (query.trim().toLowerCase().startsWith('select')) {
        const result = stmt.all();
        res.json(result);
      } else {
        const result = stmt.run();
        res.json(result);
      }
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
