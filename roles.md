# AgraRide - Role-Based Team Documentation

## Team Structure & Role Distribution

This document divides the AgraRide system into 4 distinct roles for a 4-person development team. Each role has specific responsibilities, features to work on, and areas of expertise.

### Team Collaboration Philosophy

**Agile Methodology:**
This project follows Agile principles:
- **Iterative Development**: Build features incrementally
- **Daily Standups**: 15-minute sync meetings
- **Sprint Planning**: 2-week sprints with clear goals
- **Retrospectives**: Learn and improve after each sprint

**Communication Channels:**
- **Slack/Discord**: Real-time communication
- **GitHub**: Code reviews and issue tracking
- **Jira/Trello**: Task management
- **Documentation**: Shared knowledge base

**Code Review Process:**
1. Developer creates feature branch
2. Implements feature with tests
3. Creates pull request (PR)
4. Team reviews code
5. Address feedback
6. Merge to main branch

**Definition of Done:**
- Code written and tested
- Unit tests passing
- Integration tests passing
- Code reviewed and approved
- Documentation updated
- Deployed to staging environment

---

## Table of Contents
1. [Role 1: Frontend UI/UX Developer](#role-1-frontend-uiux-developer)
2. [Role 2: Backend API Developer](#role-2-backend-api-developer)
3. [Role 3: Database & Admin Systems Developer](#role-3-database--admin-systems-developer)
4. [Role 4: Maps & Real-Time Features Developer](#role-4-maps--real-time-features-developer)
5. [Cross-Role Collaboration](#cross-role-collaboration)
6. [Development Workflow](#development-workflow)
7. [Testing Strategy](#testing-strategy)

---


## Role 1: Frontend UI/UX Developer

### Primary Responsibilities
- User interface design and implementation
- User experience optimization
- Authentication pages
- Home and landing pages
- Profile and user-facing components
- Responsive design
- Animations and transitions

### Features Owned

#### 1. Authentication System (Frontend)
**Files:**
- `src/pages/AuthPage.tsx`
- `src/App.tsx` (authentication logic)

**Responsibilities:**
- Login/Register forms
- Form validation
- User session management (localStorage)
- Animated transitions between login/register
- Error handling and display
- Responsive mobile design

**Key Code Sections:**
```typescript
// Handle user login
const handleLoginSubmit = async (e: FormEvent) => {
  e.preventDefault();
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    onLogin(data);
    navigate(data.role === 'admin' ? '/admin' : '/');
  }
};
```

#### 2. Home & Landing Page
**Files:**
- `src/pages/Home.tsx`

**Responsibilities:**
- Hero section with Taj Mahal background
- Feature cards (Verified Profiles, Live Tracking, Cost Effective)
- Call-to-action buttons
- Animations using Framer Motion
- Responsive grid layouts

**Design Elements:**
- Gradient backgrounds
- Glassmorphism effects
- Hover animations
- Icon integration (Lucide React)

#### 3. User Profile Page
**Files:**
- `src/pages/Profile.tsx`

**Responsibilities:**
- Display user information
- Show statistics (total rides, completed rides, success rate)
- Rating display with star visualization
- Recent reviews section
- Responsive card layouts

**Statistics Displayed:**
- Total rides offered
- Completed rides
- Success rate percentage
- Total bookings made
- Average rating
- Recent reviews from other users

#### 4. Navigation & Layout
**Files:**
- `src/components/common/Navbar.tsx`
- `src/components/common/AnimatedLogo.tsx`

**Responsibilities:**
- Top navigation bar
- Mobile hamburger menu
- User profile dropdown
- Logout functionality
- Responsive design for mobile/tablet/desktop
- Animated logo component

#### 5. Styling & Design System
**Files:**
- `src/index.css`
- Tailwind configuration

**Responsibilities:**
- Global styles
- Color scheme (primary orange, slate grays)
- Typography (font-display for headings)
- Reusable CSS classes (btn-primary, btn-secondary, badge, input-field)
- Responsive breakpoints
- Animation utilities

**Design Tokens:**
```css
:root {
  --primary: #f97316; /* Orange */
  --ink: #0f172a; /* Dark slate */
}

.btn-primary {
  background: var(--primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 1.5rem;
  font-weight: bold;
}
```

### Technologies to Master
- React 19 (hooks, state management)
- TypeScript (interfaces, types)
- Tailwind CSS (utility classes)
- Framer Motion (animations)
- React Router (navigation)
- Responsive design principles

### Testing Checklist
- [ ] Login/Register forms work correctly
- [ ] Form validation displays errors
- [ ] Session persists on page refresh
- [ ] Mobile menu opens/closes properly
- [ ] All animations are smooth
- [ ] Profile page displays correct data
- [ ] Responsive on mobile, tablet, desktop

### API Endpoints Used
- `POST /api/register`
- `POST /api/login`
- `GET /api/ratings/:userId`
- `GET /api/rides/driver/:driverId`
- `GET /api/bookings/passenger/:passengerId`

---


## Role 2: Backend API Developer

### Primary Responsibilities
- RESTful API design and implementation
- Business logic layer
- Authentication endpoints
- Ride and booking management APIs
- Error handling and validation
- API documentation

### Features Owned

#### 1. Authentication APIs
**Files:**
- `server.ts` (Auth section)

**Endpoints:**
```typescript
// POST /api/register - Register new user
app.post("/api/register", (req, res) => {
  const { name, email, password, phone, gender, vehicle_type } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, password, phone, gender, vehicle_type) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email, password, phone, gender, vehicle_type);
    res.json({ id: result.lastInsertRowid, name, email, role: 'user', gender, vehicle_type });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/login - Authenticate user
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
  if (user) {
    res.json({ id, name, email, role, gender, vehicle_type });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});
```

**Responsibilities:**
- Validate user input
- Check for duplicate emails
- Return appropriate error codes
- Send user data on success

#### 2. Ride Management APIs
**Files:**
- `server.ts` (Rides section)

**Endpoints:**
- `GET /api/rides` - List all active rides
- `POST /api/rides` - Create new ride
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride (with cascade)
- `POST /api/rides/complete/:id` - Mark ride as completed
- `GET /api/rides/driver/:driverId` - Get driver's rides

**Key Logic:**
```typescript
// Create ride with GPS coordinates
app.post("/api/rides", (req, res) => {
  const { driver_id, origin, destination, departure_time, available_seats, 
          price_per_seat, origin_lat, origin_lng, dest_lat, dest_lng } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO rides (driver_id, origin, destination, departure_time, 
                         available_seats, price_per_seat, origin_lat, 
                         origin_lng, dest_lat, dest_lng) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(driver_id, origin, destination, departure_time, available_seats, 
           price_per_seat, origin_lat, origin_lng, dest_lat, dest_lng);
    res.json({ id: result.lastInsertRowid });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Delete ride with cascade
app.delete("/api/rides/:id", (req, res) => {
  const { id } = req.params;
  try {
    // Delete all related records first
    db.prepare("DELETE FROM bookings WHERE ride_id = ?").run(id);
    db.prepare("DELETE FROM locations WHERE ride_id = ?").run(id);
    db.prepare("DELETE FROM messages WHERE ride_id = ?").run(id);
    db.prepare("DELETE FROM ratings WHERE ride_id = ?").run(id);
    db.prepare("DELETE FROM sos_alerts WHERE ride_id = ?").run(id);
    // Finally delete the ride
    db.prepare("DELETE FROM rides WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
```

#### 3. Booking System APIs
**Files:**
- `server.ts` (Bookings section)

**Endpoints:**
- `POST /api/bookings` - Create booking (with counter-offer)
- `POST /api/bookings/accept/:id` - Accept booking
- `POST /api/bookings/reject/:id` - Reject booking
- `GET /api/bookings/driver/:driverId` - Get driver's pending requests
- `GET /api/bookings/passenger/:passengerId` - Get passenger's bookings
- `GET /api/bookings/check/:rideId/:passengerId` - Check booking status

**Counter-Offer Logic:**
```typescript
app.post("/api/bookings", (req, res) => {
  const { ride_id, passenger_id, seats_booked, counter_offer_price } = req.body;
  try {
    // Check for existing booking
    const existingBooking = db.prepare(
      "SELECT * FROM bookings WHERE ride_id = ? AND passenger_id = ? AND status IN ('pending', 'confirmed')"
    ).get(ride_id, passenger_id);
    
    if (existingBooking) {
      return res.status(400).json({ error: "You have already requested or booked this ride" });
    }

    // Check seat availability
    const ride = db.prepare('SELECT available_seats FROM rides WHERE id = ?').get(ride_id);
    if (ride.available_seats < seats_booked) {
      return res.status(400).json({ error: "Not enough seats available" });
    }

    // Create booking with optional counter-offer
    db.prepare(
      'INSERT INTO bookings (ride_id, passenger_id, seats_booked, status, counter_offer_price) VALUES (?, ?, ?, ?, ?)'
    ).run(ride_id, passenger_id, seats_booked, 'pending', counter_offer_price || null);
    
    res.json({ 
      success: true, 
      message: counter_offer_price ? "Counter offer sent to driver" : "Booking request sent to driver" 
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
```

#### 4. Messaging APIs
**Files:**
- `server.ts` (Chat section)

**Endpoints:**
- `GET /api/messages/:rideId` - Get messages for a ride
- `POST /api/messages` - Send a message
- `GET /api/inbox/:userId` - Get user's conversations

**Implementation:**
```typescript
// Send message
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

// Get inbox conversations
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
```

#### 5. Rating System APIs
**Files:**
- `server.ts` (Ratings section)

**Endpoints:**
- `POST /api/ratings` - Submit a rating
- `GET /api/ratings/:userId` - Get user's ratings and average

**Implementation:**
```typescript
// Submit rating
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

// Get ratings with average
app.get("/api/ratings/:userId", (req, res) => {
  const { userId } = req.params;
  const ratings = db.prepare(`
    SELECT r.*, u.name as rater_name 
    FROM ratings r 
    JOIN users u ON r.rater_id = u.id 
    WHERE r.rated_user_id = ?
  `).all(userId);
  
  const avgRating = db.prepare(
    'SELECT AVG(rating) as avg FROM ratings WHERE rated_user_id = ?'
  ).get(userId);
  
  res.json({ ratings, average: avgRating.avg || 0 });
});
```

### Technologies to Master
- Node.js & Express.js
- TypeScript
- RESTful API design
- SQL queries with better-sqlite3
- Error handling
- HTTP status codes
- Request validation

### Testing Checklist
- [ ] All endpoints return correct status codes
- [ ] Error messages are descriptive
- [ ] SQL queries are parameterized (no injection)
- [ ] Cascade deletes work properly
- [ ] Counter-offer logic functions correctly
- [ ] Duplicate booking prevention works
- [ ] Seat availability is checked

### Database Tables Used
- users
- rides
- bookings
- messages
- ratings

---


## Role 3: Database & Admin Systems Developer

### Primary Responsibilities
- Database schema design and management
- Admin dashboard implementation
- System monitoring and statistics
- User management features
- Database query interface
- SOS alert system

### Features Owned

#### 1. Database Schema & Setup
**Files:**
- `db.ts`

**Responsibilities:**
- Design and create all database tables
- Define relationships and foreign keys
- Handle schema migrations
- Seed initial data (admin user)
- Ensure data integrity

**Tables Managed:**
```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  phone TEXT,
  gender TEXT,
  vehicle_type TEXT
);

-- Rides table
CREATE TABLE rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  available_seats INTEGER NOT NULL,
  price_per_seat REAL NOT NULL,
  status TEXT DEFAULT 'active',
  origin_lat REAL,
  origin_lng REAL,
  dest_lat REAL,
  dest_lng REAL,
  FOREIGN KEY (driver_id) REFERENCES users (id)
);

-- Bookings table
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id INTEGER,
  passenger_id INTEGER,
  seats_booked INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  counter_offer_price REAL,
  FOREIGN KEY (ride_id) REFERENCES rides (id),
  FOREIGN KEY (passenger_id) REFERENCES users (id)
);

-- SOS Alerts table
CREATE TABLE sos_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id INTEGER,
  user_id INTEGER,
  status TEXT DEFAULT 'active',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

**Schema Migration Logic:**
```typescript
// Add columns if they don't exist (for existing databases)
try { db.exec("ALTER TABLE users ADD COLUMN gender TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN vehicle_type TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE bookings ADD COLUMN counter_offer_price REAL;"); } catch (e) {}
```

#### 2. Admin Dashboard Frontend
**Files:**
- `src/pages/AdminDashboard.tsx`

**Responsibilities:**
- System statistics overview
- Recent ride activity table
- Tab navigation (Overview, Rides, Users, Security, Database)
- Real-time data polling (every 10 seconds)
- Responsive admin interface

**Statistics Display:**
```typescript
// Fetch and display system stats
const fetchStats = () => {
  fetch('/api/admin/stats')
    .then(res => res.json())
    .then(setStats);
};

// Display cards
<div className="grid md:grid-cols-3 gap-10">
  <StatCard label="Total Users" value={stats.users} icon={User} />
  <StatCard label="Active Rides" value={stats.rides} icon={Car} />
  <StatCard label="Total Bookings" value={stats.bookings} icon={TrendingUp} />
</div>
```

#### 3. User Management System
**Files:**
- `src/pages/AdminDashboard.tsx` (Users tab)
- `server.ts` (Admin user endpoints)

**Features:**
- View all users in a table
- Search users by name, email, phone, ID
- Delete users (with cascade delete)
- Change user roles (user ↔ admin)
- Display user details (gender, vehicle, phone)

**User Management APIs:**
```typescript
// GET /api/admin/users - List all users
app.get("/api/admin/users", (req, res) => {
  const users = db.prepare(
    'SELECT id, name, email, phone, gender, vehicle_type, role FROM users ORDER BY id DESC'
  ).all();
  res.json(users);
});

// DELETE /api/admin/users/:id - Delete user with cascade
app.delete("/api/admin/users/:id", (req, res) => {
  const { id } = req.params;
  try {
    // Get all rides by this user
    const userRides = db.prepare('SELECT id FROM rides WHERE driver_id = ?').all(id);
    
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
    
    // Delete user's bookings, locations, messages, ratings, SOS alerts
    db.prepare('DELETE FROM bookings WHERE passenger_id = ?').run(id);
    db.prepare('DELETE FROM locations WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?').run(id, id);
    db.prepare('DELETE FROM ratings WHERE rater_id = ? OR rated_user_id = ?').run(id, id);
    db.prepare('DELETE FROM sos_alerts WHERE user_id = ?').run(id);
    
    // Finally delete the user
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/admin/users/:id/role - Change user role
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
```

#### 4. Ride Management System
**Files:**
- `src/pages/AdminDashboard.tsx` (Rides tab)
- `server.ts` (Admin ride endpoints)

**Features:**
- View all rides (active and completed)
- Search rides by driver, location, ID
- Filter by status (all/active/completed)
- Delete rides
- Mark rides as completed
- Track rides live

**Ride Management Table:**
```typescript
// Display rides in table with actions
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Driver</th>
      <th>Route</th>
      <th>Departure</th>
      <th>Seats</th>
      <th>Price</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredRides.map(ride => (
      <tr key={ride.id}>
        <td>#{ride.id}</td>
        <td>{ride.driver_name}</td>
        <td>{ride.origin} → {ride.destination}</td>
        <td>{new Date(ride.departure_time).toLocaleString()}</td>
        <td>{ride.available_seats}</td>
        <td>₹{ride.price_per_seat}</td>
        <td><Badge status={ride.status} /></td>
        <td>
          <button onClick={() => setSelectedRide(ride)}>Track</button>
          <button onClick={() => completeRide(ride.id)}>Complete</button>
          <button onClick={() => deleteRide(ride.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

#### 5. SOS Alert System
**Files:**
- `src/pages/AdminDashboard.tsx` (Security tab)
- `server.ts` (SOS endpoints)

**Features:**
- Display active SOS alerts
- Show ride and user details
- Track ride location live
- Resolve alerts
- Real-time monitoring

**SOS APIs:**
```typescript
// POST /api/sos - Create SOS alert
app.post("/api/sos", (req, res) => {
  const { ride_id, user_id } = req.body;
  try {
    db.prepare('INSERT INTO sos_alerts (ride_id, user_id) VALUES (?, ?)').run(ride_id, user_id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/sos/resolve/:id - Resolve SOS alert
app.post("/api/sos/resolve/:id", (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("UPDATE sos_alerts SET status = 'resolved' WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/admin/stats - Includes active SOS alerts
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
```

**SOS Alert Display:**
```typescript
// Display active SOS alerts with animation
{stats.activeSOS.map((sos: any) => (
  <div key={sos.id} className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div>
        <h4>Alert Triggered By: {sos.user_name}</h4>
        <p>Driver: {sos.driver_name}</p>
        <p>Passengers: {sos.passengers || 'None'}</p>
        <p>Route: {sos.origin} → {sos.destination}</p>
      </div>
      <div className="flex gap-4">
        <button onClick={() => setSelectedRide(sos)} className="bg-red-600 text-white">
          Track Live
        </button>
        <button onClick={() => resolveSOS(sos.id)} className="bg-white text-red-600">
          Resolve
        </button>
      </div>
    </div>
  </div>
))}
```

#### 6. Database Management Interface
**Files:**
- `src/components/admin/DatabaseManager.tsx`
- `server.ts` (Database endpoints)

**Features:**
- List all database tables
- View table contents
- Execute custom SQL queries
- Direct database access for debugging

**Database APIs:**
```typescript
// GET /api/admin/db/tables - List all tables
app.get("/api/admin/db/tables", (req, res) => {
  try {
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all();
    res.json(tables);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/db/table/:tableName - Get table data
app.get("/api/admin/db/table/:tableName", (req, res) => {
  const { tableName } = req.params;
  try {
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/db/query - Execute custom query
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
```

#### 7. System Statistics
**Files:**
- `server.ts` (Admin stats endpoint)

**Statistics Provided:**
- Total users count
- Total rides count
- Total bookings count
- Recent rides (last 10)
- Detailed bookings (passenger-driver pairings)
- Active SOS alerts

**Stats API:**
```typescript
app.get("/api/admin/stats", (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const rideCount = db.prepare('SELECT COUNT(*) as count FROM rides').get();
  const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
  
  const recentRides = db.prepare(
    'SELECT r.*, u.name as driver_name FROM rides r JOIN users u ON r.driver_id = u.id ORDER BY r.id DESC LIMIT 10'
  ).all();
  
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
    SELECT s.*, u.name as user_name, r.origin, r.destination
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
```

### Technologies to Master
- SQLite database design
- SQL queries (SELECT, INSERT, UPDATE, DELETE, JOIN)
- Database relationships and foreign keys
- Cascade deletes
- Data aggregation (COUNT, AVG, GROUP_CONCAT)
- React table components
- Admin UI/UX patterns

### Testing Checklist
- [ ] All tables created successfully
- [ ] Foreign key constraints work
- [ ] Cascade deletes remove all related data
- [ ] Admin can view all users
- [ ] Admin can delete users safely
- [ ] Admin can change user roles
- [ ] SOS alerts display correctly
- [ ] Database queries execute without errors
- [ ] Statistics are accurate

### Security Considerations
- Admin-only endpoints should check user role
- SQL injection prevention (use parameterized queries)
- Validate all user inputs
- Confirm destructive actions (delete user/ride)

---


## Role 4: Maps & Real-Time Features Developer

### Primary Responsibilities
- Map integration and visualization
- Real-time GPS location tracking
- Location picker components
- Route preview and navigation
- Ride search and booking UI
- My Rides and My Bookings pages

### Features Owned

#### 1. Map Integration
**Files:**
- `src/components/ride/GoogleMap.tsx`
- `src/components/ride/SimulatedMap.tsx`
- `src/components/ride/LocationPicker.tsx`
- `src/components/ride/RoutePreview.tsx`

**Responsibilities:**
- Integrate Leaflet/OpenStreetMap
- Display markers for origin and destination
- Show route between two points
- Real-time location updates
- Interactive map controls

**Map Component:**
```typescript
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

export const GoogleMap = ({ ride, currentUser, onClose }) => {
  const [locations, setLocations] = useState([]);
  
  // Fetch locations every 3 seconds
  useEffect(() => {
    const fetchLocations = async () => {
      const res = await fetch(`/api/locations/${ride.id}`);
      const data = await res.json();
      setLocations(data);
    };
    
    fetchLocations();
    const interval = setInterval(fetchLocations, 3000);
    return () => clearInterval(interval);
  }, [ride.id]);

  return (
    <MapContainer center={[27.1767, 78.0081]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Origin marker */}
      <Marker position={[ride.origin_lat, ride.origin_lng]}>
        <Popup>Origin: {ride.origin}</Popup>
      </Marker>
      
      {/* Destination marker */}
      <Marker position={[ride.dest_lat, ride.dest_lng]}>
        <Popup>Destination: {ride.destination}</Popup>
      </Marker>
      
      {/* Current location markers */}
      {locations.map(loc => (
        <Marker key={loc.user_id} position={[loc.latitude, loc.longitude]}>
          <Popup>{loc.user_name}</Popup>
        </Marker>
      ))}
      
      {/* Route line */}
      <Polyline 
        positions={[
          [ride.origin_lat, ride.origin_lng],
          [ride.dest_lat, ride.dest_lng]
        ]} 
        color="blue" 
      />
    </MapContainer>
  );
};
```

#### 2. Location Picker
**Files:**
- `src/components/ride/LocationPicker.tsx`

**Features:**
- Interactive map for selecting locations
- Search functionality (using Nominatim API)
- Current location detection
- Click to select on map
- Display selected coordinates

**Implementation:**
```typescript
export const LocationPicker = ({ title, initialLocation, onLocationSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPos, setSelectedPos] = useState(null);

  // Search locations using Nominatim
  const handleSearch = async () => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery},Agra,India`
    );
    const data = await res.json();
    setSearchResults(data);
  };

  // Handle map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedPos({ lat, lng });
  };

  // Confirm selection
  const handleConfirm = async () => {
    if (selectedPos) {
      // Reverse geocode to get location name
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedPos.lat}&lon=${selectedPos.lng}`
      );
      const data = await res.json();
      
      onLocationSelect({
        name: data.display_name,
        lat: selectedPos.lat,
        lng: selectedPos.lng
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="bg-white rounded-3xl p-8">
        <h3>{title}</h3>
        
        {/* Search bar */}
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location..."
        />
        <button onClick={handleSearch}>Search</button>
        
        {/* Search results */}
        {searchResults.map(result => (
          <div key={result.place_id} onClick={() => {
            setSelectedPos({ lat: result.lat, lng: result.lon });
          }}>
            {result.display_name}
          </div>
        ))}
        
        {/* Map */}
        <MapContainer center={[27.1767, 78.0081]} zoom={13} onClick={handleMapClick}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selectedPos && <Marker position={[selectedPos.lat, selectedPos.lng]} />}
        </MapContainer>
        
        {/* Confirm button */}
        <button onClick={handleConfirm}>Confirm Location</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};
```

#### 3. Real-Time Location Tracking
**Files:**
- `server.ts` (Location endpoints)
- `src/components/ride/GoogleMap.tsx`

**Features:**
- Capture GPS coordinates from browser
- Send location updates to server
- Poll server for location updates
- Display multiple user locations
- Auto-update every 3 seconds

**Location Tracking (Driver Side):**
```typescript
// In MyRides.tsx or active ride component
useEffect(() => {
  if (!currentRide || !user) return;
  
  // Watch position continuously
  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      // Send to server
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: currentRide.id,
          user_id: user.id,
          latitude,
          longitude
        })
      });
    },
    (error) => console.error('Location error:', error),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
  );
  
  return () => navigator.geolocation.clearWatch(watchId);
}, [currentRide, user]);
```

**Location Tracking (Passenger Side):**
```typescript
// In MyBookings.tsx or tracking component
useEffect(() => {
  if (!trackingRide) return;
  
  const fetchLocations = async () => {
    const res = await fetch(`/api/locations/${trackingRide.id}`);
    const data = await res.json();
    setLocations(data);
  };
  
  fetchLocations();
  const interval = setInterval(fetchLocations, 3000); // Poll every 3 seconds
  
  return () => clearInterval(interval);
}, [trackingRide]);
```

**Location APIs:**
```typescript
// POST /api/locations - Update location
app.post("/api/locations", (req, res) => {
  const { ride_id, user_id, latitude, longitude } = req.body;
  try {
    const existing = db.prepare(
      'SELECT id FROM locations WHERE ride_id = ? AND user_id = ?'
    ).get(ride_id, user_id);
    
    if (existing) {
      // Update existing location
      db.prepare(
        'UPDATE locations SET latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP WHERE ride_id = ? AND user_id = ?'
      ).run(latitude, longitude, ride_id, user_id);
    } else {
      // Insert new location
      db.prepare(
        'INSERT INTO locations (ride_id, user_id, latitude, longitude) VALUES (?, ?, ?, ?)'
      ).run(ride_id, user_id, latitude, longitude);
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/locations/:rideId - Get all locations for a ride
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
```

#### 4. Search Rides Page
**Files:**
- `src/pages/SearchRides.tsx`

**Features:**
- Display all active rides
- Search/filter functionality
- Ride details expansion
- Counter-offer interface
- Route preview
- Booking confirmation

**Key Components:**
```typescript
export const SearchRides = ({ user }) => {
  const [rides, setRides] = useState([]);
  const [bookingRideId, setBookingRideId] = useState(null);
  const [counterOfferPrice, setCounterOfferPrice] = useState(null);
  const [previewRide, setPreviewRide] = useState(null);

  // Fetch rides with ratings
  useEffect(() => {
    const fetchRides = async () => {
      const res = await fetch('/api/rides');
      const data = await res.json();

      const ridesWithRatings = await Promise.all(data.map(async (ride) => {
        const ratingRes = await fetch(`/api/ratings/${ride.driver_id}`);
        const ratingData = await ratingRes.json();
        return { ...ride, avg_rating: ratingData.average || 4.5 };
      }));

      setRides(ridesWithRatings);
    };
    fetchRides();
  }, []);

  // Handle booking with counter-offer
  const handleConfirmBooking = async (rideId) => {
    if (!user) return alert("Please login to book a ride");
    
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ride_id: rideId, 
        passenger_id: user.id, 
        seats_booked: 1,
        counter_offer_price: counterOfferPrice 
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      alert(data.message);
      setBookingRideId(null);
      setCounterOfferPrice(null);
    }
  };

  return (
    <div>
      {/* Search bar */}
      <input placeholder="Search landmarks..." />
      
      {/* Rides list */}
      {rides.map(ride => (
        <div key={ride.id} className="ride-card">
          {/* Driver info */}
          <div>
            <h4>{ride.driver_name}</h4>
            <StarRating rating={ride.avg_rating} />
            <span>{ride.driver_gender}</span>
            <span>{ride.driver_vehicle}</span>
          </div>
          
          {/* Route */}
          <div>
            <span>{ride.origin}</span>
            <ChevronRight />
            <span>{ride.destination}</span>
          </div>
          
          {/* Price and seats */}
          <div>
            <span>₹{ride.price_per_seat}</span>
            <span>{ride.available_seats} seats</span>
          </div>
          
          {/* Actions */}
          <button onClick={() => setPreviewRide(ride)}>View Route</button>
          <button onClick={() => setBookingRideId(ride.id)}>Book Ride</button>
          
          {/* Expanded booking section */}
          {bookingRideId === ride.id && (
            <div>
              {/* Counter-offer input */}
              <input 
                type="number"
                value={counterOfferPrice}
                onChange={(e) => setCounterOfferPrice(parseInt(e.target.value))}
                placeholder="Make a counter offer"
              />
              
              <button onClick={() => handleConfirmBooking(ride.id)}>
                {counterOfferPrice ? 'Send Counter Offer' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>
      ))}
      
      {/* Route preview modal */}
      {previewRide && (
        <RoutePreview 
          ride={previewRide} 
          onClose={() => setPreviewRide(null)} 
        />
      )}
    </div>
  );
};
```

#### 5. Offer Ride Page
**Files:**
- `src/pages/OfferRide.tsx`

**Features:**
- Vehicle type selection
- Location picker integration
- Current location detection
- Departure time picker
- Seat and price configuration
- Form validation

**Key Features:**
```typescript
export const OfferRide = ({ user }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    origin_lat: null,
    origin_lng: null,
    dest_lat: null,
    dest_lng: null,
    departure_time: '',
    available_seats: 3,
    price_per_seat: 100,
    vehicle_type: '4-wheeler',
    vehicle_description: ''
  });
  const [showOriginPicker, setShowOriginPicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);

  // Use current location
  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          
          setFormData(prev => ({
            ...prev,
            origin: data.display_name,
            origin_lat: lat,
            origin_lng: lng
          }));
        },
        (error) => alert('Could not get your location: ' + error.message)
      );
    }
  };

  // Submit ride
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/rides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driver_id: user.id,
        ...formData
      })
    });
    
    if (res.ok) {
      navigate('/search');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vehicle type */}
      <div>
        <button type="button" onClick={() => setFormData({ ...formData, vehicle_type: '4-wheeler' })}>
          4-Wheeler
        </button>
        <button type="button" onClick={() => setFormData({ ...formData, vehicle_type: '2-wheeler' })}>
          2-Wheeler
        </button>
      </div>
      
      {/* Vehicle description */}
      <input 
        placeholder="e.g. Honda Amaze (White) - UP80 AB 1234"
        value={formData.vehicle_description}
        onChange={(e) => setFormData({ ...formData, vehicle_description: e.target.value })}
      />
      
      {/* Origin */}
      <div>
        <input value={formData.origin} readOnly />
        <button type="button" onClick={handleUseCurrentLocation}>Current Location</button>
        <button type="button" onClick={() => setShowOriginPicker(true)}>Pick on Map</button>
      </div>
      
      {/* Destination */}
      <div>
        <input value={formData.destination} readOnly />
        <button type="button" onClick={() => setShowDestPicker(true)}>Pick on Map</button>
      </div>
      
      {/* Departure time */}
      <input 
        type="datetime-local"
        value={formData.departure_time}
        onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
      />
      
      {/* Price */}
      <input 
        type="number"
        value={formData.price_per_seat}
        onChange={(e) => setFormData({ ...formData, price_per_seat: parseInt(e.target.value) })}
      />
      
      {/* Seats */}
      <div>
        {[1, 2, 3, 4, 5, 6].map(num => (
          <button 
            key={num}
            type="button"
            onClick={() => setFormData({ ...formData, available_seats: num })}
          >
            {num}
          </button>
        ))}
      </div>
      
      <button type="submit">Publish Ride</button>
      
      {/* Location pickers */}
      {showOriginPicker && (
        <LocationPicker 
          title="Select Pickup Point"
          onLocationSelect={(loc) => {
            setFormData(prev => ({
              ...prev,
              origin: loc.name,
              origin_lat: loc.lat,
              origin_lng: loc.lng
            }));
            setShowOriginPicker(false);
          }}
          onClose={() => setShowOriginPicker(false)}
        />
      )}
      
      {showDestPicker && (
        <LocationPicker 
          title="Select Drop Point"
          onLocationSelect={(loc) => {
            setFormData(prev => ({
              ...prev,
              destination: loc.name,
              dest_lat: loc.lat,
              dest_lng: loc.lng
            }));
            setShowDestPicker(false);
          }}
          onClose={() => setShowDestPicker(false)}
        />
      )}
    </form>
  );
};
```

#### 6. My Rides Page
**Files:**
- `src/pages/MyRides.tsx`

**Features:**
- Display driver's offered rides
- Edit ride details
- Delete rides
- Complete rides
- Live tracking button
- Booking requests component

**Key Features:**
```typescript
export const MyRides = ({ user }) => {
  const [rides, setRides] = useState([]);
  const [trackingRide, setTrackingRide] = useState(null);
  const [editingRide, setEditingRide] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/rides/driver/${user.id}`)
      .then(res => res.json())
      .then(setRides);
  }, [user]);

  const completeRide = async (rideId) => {
    await fetch(`/api/rides/complete/${rideId}`, { method: 'POST' });
    setRides(rides.map(r => r.id === rideId ? { ...r, status: 'completed' } : r));
  };

  const deleteRide = async (rideId) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/rides/${rideId}`, { method: 'DELETE' });
    setRides(rides.filter(r => r.id !== rideId));
  };

  return (
    <div>
      {/* Booking requests */}
      <BookingRequests user={user} />
      
      {/* Rides list */}
      {rides.map(ride => (
        <div key={ride.id}>
          <div>
            <span>{ride.origin} → {ride.destination}</span>
            <span>{ride.available_seats} seats</span>
            <span>₹{ride.price_per_seat}</span>
            <span>{ride.status}</span>
          </div>
          
          {ride.status === 'active' && (
            <div>
              <button onClick={() => setTrackingRide(ride)}>Track Live</button>
              <button onClick={() => setEditingRide(ride)}>Edit</button>
              <button onClick={() => deleteRide(ride.id)}>Delete</button>
              <button onClick={() => completeRide(ride.id)}>Complete</button>
            </div>
          )}
        </div>
      ))}
      
      {/* Live tracking modal */}
      {trackingRide && (
        <GoogleMap 
          ride={trackingRide}
          currentUser={user}
          onClose={() => setTrackingRide(null)}
        />
      )}
    </div>
  );
};
```

#### 7. My Bookings Page
**Files:**
- `src/pages/MyBookings.tsx`

**Features:**
- Display passenger's bookings
- Show booking status
- Live tracking for active rides
- Rate completed rides

**Implementation:**
```typescript
export const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [trackingRide, setTrackingRide] = useState(null);
  const [ratingRide, setRatingRide] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/bookings/passenger/${user.id}`)
      .then(res => res.json())
      .then(setBookings);
  }, [user]);

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.id}>
          <div>
            <span>{booking.origin} → {booking.destination}</span>
            <span>Driver: {booking.driver_name}</span>
            <span>Status: {booking.status}</span>
            <span>Ride: {booking.ride_status}</span>
          </div>
          
          {booking.status === 'confirmed' && booking.ride_status === 'active' && (
            <button onClick={() => setTrackingRide({
              id: booking.ride_id,
              driver_id: booking.driver_id,
              driver_name: booking.driver_name,
              origin: booking.origin,
              destination: booking.destination
            })}>
              Track Live
            </button>
          )}
          
          {booking.ride_status === 'completed' && booking.status === 'confirmed' && (
            <button onClick={() => setRatingRide({
              id: booking.ride_id,
              driver_id: booking.driver_id,
              driver_name: booking.driver_name
            })}>
              Rate Ride
            </button>
          )}
        </div>
      ))}
      
      {/* Tracking modal */}
      {trackingRide && (
        <GoogleMap 
          ride={trackingRide}
          currentUser={user}
          onClose={() => setTrackingRide(null)}
        />
      )}
      
      {/* Rating modal */}
      {ratingRide && (
        <RatingModal 
          ride={ratingRide}
          currentUser={user}
          onClose={() => setRatingRide(null)}
        />
      )}
    </div>
  );
};
```

### Technologies to Master
- Leaflet & React-Leaflet
- OpenStreetMap & Nominatim API
- Browser Geolocation API
- Real-time data polling
- Map markers and polylines
- Geocoding and reverse geocoding
- React hooks (useState, useEffect)
- Async/await patterns

### Testing Checklist
- [ ] Maps display correctly
- [ ] Location picker works on mobile and desktop
- [ ] Current location detection works
- [ ] GPS coordinates are accurate
- [ ] Real-time tracking updates every 3 seconds
- [ ] Route visualization is clear
- [ ] Search rides displays all active rides
- [ ] Counter-offer feature works
- [ ] Booking confirmation works
- [ ] My Rides shows correct data
- [ ] My Bookings shows correct data
- [ ] Live tracking works for both driver and passenger

### API Endpoints Used
- `GET /api/rides`
- `POST /api/rides`
- `PUT /api/rides/:id`
- `DELETE /api/rides/:id`
- `POST /api/rides/complete/:id`
- `GET /api/rides/driver/:driverId`
- `POST /api/bookings`
- `GET /api/bookings/driver/:driverId`
- `GET /api/bookings/passenger/:passengerId`
- `POST /api/locations`
- `GET /api/locations/:rideId`
- `GET /api/ratings/:userId`

### External APIs Used
- **Nominatim (OpenStreetMap)**
  - Search: `https://nominatim.openstreetmap.org/search?format=json&q={query}`
  - Reverse Geocode: `https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}`

---

## Team Collaboration Guidelines

### Communication
- Daily standup meetings to sync progress
- Use version control (Git) for code management
- Document all API changes
- Share database schema updates
- Test integrations between roles

### Code Standards
- Use TypeScript for type safety
- Follow consistent naming conventions
- Comment complex logic
- Write reusable components
- Handle errors gracefully

### Testing Strategy
- Each role tests their own features
- Integration testing between roles
- End-to-end testing of complete flows
- Mobile responsiveness testing
- Performance testing

### Deployment
- Role 2 (Backend) deploys server
- Role 1 (Frontend) builds UI
- Role 3 (Database) manages migrations
- Role 4 (Maps) configures API keys

---

## Conclusion

This role-based documentation divides the AgraRide system into 4 manageable parts, each with clear responsibilities and ownership. Each team member should:

1. Master their assigned technologies
2. Complete their testing checklist
3. Document their code
4. Communicate with other roles
5. Integrate their features with the system

By following this structure, the team can work efficiently and deliver a high-quality carpooling application.

---

**Last Updated**: March 9, 2026
**Team Size**: 4 developers
**Project**: AgraRide Carpooling Platform

## Cross-Role Collaboration

### Integration Points

#### Frontend ↔ Backend
**Interface**: REST API
**Contract**: API documentation in system.md

**Collaboration Process:**
1. Backend developer defines API endpoints
2. Frontend developer reviews and provides feedback
3. Both agree on request/response format
4. Backend implements endpoints
5. Frontend integrates with API
6. Both test integration together

**Example Workflow:**
```
Backend: "I've created POST /api/bookings endpoint"
Frontend: "Can you add counter_offer_price field?"
Backend: "Done. Updated API docs."
Frontend: "Testing now... works great!"
```

#### Backend ↔ Database
**Interface**: SQL queries
**Contract**: Database schema in db.ts

**Collaboration Process:**
1. Database developer designs schema
2. Backend developer reviews for API needs
3. Database developer creates tables
4. Backend developer writes queries
5. Database developer optimizes queries

**Example Workflow:**
```
Database: "Created bookings table with status field"
Backend: "Need counter_offer_price column too"
Database: "Added. Also created index on ride_id"
Backend: "Perfect, queries are fast now"
```

#### Frontend ↔ Maps Developer
**Interface**: Shared components and state
**Contract**: Component props and interfaces

**Collaboration Process:**
1. Maps developer creates location components
2. Frontend developer integrates into pages
3. Both ensure consistent styling
4. Both test on different devices

**Example Workflow:**
```
Maps: "LocationPicker component ready"
Frontend: "Can you add current location button?"
Maps: "Done. Also added search functionality"
Frontend: "Integrated into OfferRide page"
```

#### Database ↔ Admin Developer
**Interface**: Database queries and admin UI
**Contract**: Admin dashboard requirements

**Collaboration Process:**
1. Admin developer defines requirements
2. Database developer ensures data availability
3. Admin developer builds dashboard
4. Database developer optimizes queries

### Conflict Resolution

**Code Conflicts:**
1. Use Git branches for features
2. Merge main into feature branch regularly
3. Resolve conflicts locally before PR
4. Ask for help if unsure

**Design Conflicts:**
1. Discuss in team meeting
2. Present pros/cons of each approach
3. Vote or defer to tech lead
4. Document decision

**Priority Conflicts:**
1. Refer to sprint goals
2. Consider user impact
3. Consult product owner
4. Adjust sprint if needed

---

## Development Workflow

### Git Workflow

**Branch Strategy:**
```
main (production-ready code)
  ├── develop (integration branch)
  │   ├── feature/auth-ui (Role 1)
  │   ├── feature/booking-api (Role 2)
  │   ├── feature/admin-dashboard (Role 3)
  │   └── feature/maps-integration (Role 4)
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(auth): add registration form validation

- Added email format validation
- Added password strength checker
- Added phone number format validation

Closes #123
```

```
fix(booking): resolve counter-offer calculation bug

Counter-offer savings were showing negative values
when offer was higher than original price.

Fixes #456
```

### Code Review Checklist

**For Reviewer:**
- [ ] Code follows project style guide
- [ ] No obvious bugs or logic errors
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate
- [ ] Code is readable and maintainable

**For Author:**
- [ ] Self-review completed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Meaningful commit messages
- [ ] PR description is clear

### Development Environment Setup

**Required Tools:**
- Node.js v18+
- npm or yarn
- Git
- VS Code (recommended)
- Chrome DevTools

**VS Code Extensions:**
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- GitLens

**Environment Variables:**
```bash
# .env.local
VITE_GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=development
```

### Daily Workflow

**Morning:**
1. Pull latest changes from main
2. Review assigned tasks
3. Attend standup meeting
4. Start working on highest priority task

**During Development:**
1. Write code in small, testable chunks
2. Commit frequently with clear messages
3. Push to remote branch regularly
4. Ask for help when stuck

**End of Day:**
1. Commit and push all changes
2. Update task status
3. Document any blockers
4. Plan next day's work

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /____\     
     /      \    Integration Tests (Some)
    /________\   
   /          \  Unit Tests (Many)
  /__________  \
```

### Unit Testing

**Purpose**: Test individual functions/components in isolation

**Tools**: Jest, React Testing Library

**Example (Frontend):**
```typescript
// StarRating.test.tsx
import { render, screen } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders correct number of filled stars', () => {
    render(<StarRating rating={3.5} />);
    const filledStars = screen.getAllByTestId('filled-star');
    expect(filledStars).toHaveLength(3);
  });

  it('renders half star for decimal ratings', () => {
    render(<StarRating rating={3.5} />);
    const halfStar = screen.getByTestId('half-star');
    expect(halfStar).toBeInTheDocument();
  });
});
```

**Example (Backend):**
```typescript
// booking.test.ts
describe('POST /api/bookings', () => {
  it('creates booking successfully', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        ride_id: 1,
        passenger_id: 2,
        seats_booked: 1
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('rejects booking with insufficient seats', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        ride_id: 1,
        passenger_id: 2,
        seats_booked: 10 // More than available
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Not enough seats');
  });
});
```

### Integration Testing

**Purpose**: Test interaction between components/modules

**Example:**
```typescript
// ride-booking-flow.test.ts
describe('Ride Booking Flow', () => {
  it('completes full booking process', async () => {
    // 1. Create ride
    const rideResponse = await request(app)
      .post('/api/rides')
      .send(rideData);
    const rideId = rideResponse.body.id;

    // 2. Create booking
    const bookingResponse = await request(app)
      .post('/api/bookings')
      .send({ ride_id: rideId, passenger_id: 2, seats_booked: 1 });
    const bookingId = bookingResponse.body.id;

    // 3. Accept booking
    const acceptResponse = await request(app)
      .post(`/api/bookings/accept/${bookingId}`);
    
    expect(acceptResponse.status).toBe(200);

    // 4. Verify seat reduction
    const updatedRide = await request(app).get(`/api/rides/${rideId}`);
    expect(updatedRide.body.available_seats).toBe(rideData.available_seats - 1);
  });
});
```

### End-to-End (E2E) Testing

**Purpose**: Test complete user workflows

**Tools**: Cypress, Playwright

**Example:**
```typescript
// booking-flow.e2e.ts
describe('Passenger Books Ride', () => {
  it('completes booking from search to confirmation', () => {
    // Login
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('passenger@test.com');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="login-btn"]').click();

    // Search rides
    cy.visit('/search');
    cy.get('[data-testid="ride-card"]').first().click();

    // Book ride
    cy.get('[data-testid="book-btn"]').click();
    cy.get('[data-testid="confirm-btn"]').click();

    // Verify success
    cy.contains('Booking request sent').should('be.visible');
    
    // Check My Bookings
    cy.visit('/my-bookings');
    cy.contains('Pending').should('be.visible');
  });
});
```

### Manual Testing Checklist

**Functional Testing:**
- [ ] All features work as expected
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Navigation works correctly
- [ ] Forms validate inputs

**UI/UX Testing:**
- [ ] Responsive on mobile, tablet, desktop
- [ ] Buttons are clickable
- [ ] Text is readable
- [ ] Colors have sufficient contrast
- [ ] Animations are smooth

**Browser Testing:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Performance Testing:**
- [ ] Page loads in < 3 seconds
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] No layout shifts

### Test Coverage Goals

**Target Coverage:**
- Unit Tests: 80%
- Integration Tests: 60%
- E2E Tests: Critical paths only

**Priority:**
1. Business logic (booking, payments)
2. Authentication and authorization
3. Data validation
4. Error handling
5. UI components

---

## Role-Specific Learning Paths

### Role 1: Frontend UI/UX Developer

**Week 1-2: Fundamentals**
- React hooks (useState, useEffect, useCallback)
- TypeScript basics (interfaces, types)
- Tailwind CSS utility classes
- Responsive design principles

**Week 3-4: Advanced**
- Framer Motion animations
- Form validation
- Error handling
- Performance optimization (React.memo, useMemo)

**Week 5-6: Integration**
- API integration with fetch
- State management patterns
- Authentication flow
- Routing with React Router

**Resources:**
- React docs: https://react.dev
- Tailwind docs: https://tailwindcss.com
- TypeScript handbook: https://www.typescriptlang.org/docs/

### Role 2: Backend API Developer

**Week 1-2: Fundamentals**
- Express.js routing
- RESTful API design
- HTTP methods and status codes
- Request/response handling

**Week 3-4: Advanced**
- Database queries with better-sqlite3
- Error handling and validation
- Authentication and authorization
- API security best practices

**Week 5-6: Integration**
- Frontend-backend integration
- API testing with Postman
- Performance optimization
- Deployment considerations

**Resources:**
- Express docs: https://expressjs.com
- REST API tutorial: https://restfulapi.net
- Node.js best practices: https://github.com/goldbergyoni/nodebestpractices

### Role 3: Database & Admin Systems Developer

**Week 1-2: Fundamentals**
- SQL basics (SELECT, INSERT, UPDATE, DELETE)
- Database design and normalization
- Foreign keys and relationships
- SQLite specifics

**Week 3-4: Advanced**
- Complex queries (JOINs, subqueries)
- Indexes and optimization
- Transactions and ACID properties
- Data migration strategies

**Week 5-6: Integration**
- Admin dashboard development
- Data visualization
- Security considerations
- Backup and recovery

**Resources:**
- SQL tutorial: https://www.sqltutorial.org
- Database design: https://www.lucidchart.com/pages/database-diagram
- SQLite docs: https://www.sqlite.org/docs.html

### Role 4: Maps & Real-Time Features Developer

**Week 1-2: Fundamentals**
- Leaflet basics
- OpenStreetMap integration
- Geolocation API
- Coordinate systems (lat/lng)

**Week 3-4: Advanced**
- Real-time data polling
- WebSocket alternatives
- Route visualization
- Distance calculations

**Week 5-6: Integration**
- Location picker component
- Live tracking implementation
- Performance optimization
- Mobile testing

**Resources:**
- Leaflet docs: https://leafletjs.com
- Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- OpenStreetMap: https://www.openstreetmap.org

---

## Communication Protocols

### Daily Standup Format

**Time**: 15 minutes, same time daily
**Format**: Each person answers:
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or help needed?

**Example:**
```
Role 1 (Frontend):
- Yesterday: Completed authentication UI
- Today: Working on ride search page
- Blockers: Need API endpoint for filtering rides

Role 2 (Backend):
- Yesterday: Implemented booking API
- Today: Adding counter-offer logic
- Blockers: None

Role 3 (Database):
- Yesterday: Optimized ride queries
- Today: Building admin dashboard
- Blockers: None

Role 4 (Maps):
- Yesterday: Integrated location picker
- Today: Implementing live tracking
- Blockers: Need clarification on update frequency
```

### Sprint Planning

**Duration**: 2 weeks
**Planning Meeting**: 2 hours at sprint start

**Agenda:**
1. Review previous sprint
2. Discuss upcoming features
3. Estimate story points
4. Assign tasks
5. Set sprint goals

**Story Point Estimation:**
- 1 point: < 2 hours
- 2 points: 2-4 hours
- 3 points: 4-8 hours
- 5 points: 1-2 days
- 8 points: 2-3 days

### Code Review Guidelines

**Response Time**: Within 24 hours
**Review Depth**: Thorough but constructive

**Good Review Comments:**
```
✓ "Consider extracting this logic into a separate function for reusability"
✓ "This could cause a race condition. Try using Promise.all instead"
✓ "Great error handling! One suggestion: add user-friendly message"

✗ "This is wrong"
✗ "Why did you do it this way?"
✗ "I would have done it differently"
```

**Approval Criteria:**
- At least one approval required
- All comments addressed
- CI/CD checks passing
- No merge conflicts

---

## Troubleshooting Guide

### Common Issues

#### Issue: "Module not found"
**Cause**: Missing dependency
**Solution**:
```bash
npm install
# or
npm install <package-name>
```

#### Issue: "Port 3000 already in use"
**Cause**: Another process using port
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### Issue: "Database locked"
**Cause**: Concurrent write operations
**Solution**: Use transactions or queue writes

#### Issue: "CORS error"
**Cause**: Frontend and backend on different origins
**Solution**: Configure CORS in server.ts

#### Issue: "Location not updating"
**Cause**: Geolocation permission denied
**Solution**: Check browser permissions

### Debugging Tips

**Frontend:**
- Use React DevTools
- Check console for errors
- Use debugger statement
- Inspect network requests

**Backend:**
- Use console.log strategically
- Check server logs
- Use Postman for API testing
- Verify database state

**Database:**
- Use SQLite browser
- Check query execution time
- Verify foreign key constraints
- Review indexes

---

## Success Metrics

### Individual Metrics

**Code Quality:**
- Test coverage > 80%
- No critical bugs in production
- Code review approval rate > 90%
- Documentation completeness

**Productivity:**
- Story points completed per sprint
- Average PR merge time < 2 days
- Bug fix time < 1 day
- Feature completion rate

**Collaboration:**
- Code review participation
- Help provided to teammates
- Communication responsiveness
- Knowledge sharing

### Team Metrics

**Velocity:**
- Story points per sprint
- Sprint goal achievement rate
- Release frequency

**Quality:**
- Bug count in production
- User-reported issues
- System uptime
- Performance metrics

**Satisfaction:**
- Team morale
- User feedback
- Stakeholder satisfaction

---

## Conclusion

This role-based documentation provides a comprehensive framework for a 4-person development team to build and maintain the AgraRide carpooling platform. Each role has clear responsibilities, learning paths, and collaboration guidelines.

### Key Takeaways

1. **Clear Ownership**: Each role owns specific features and components
2. **Collaboration**: Regular communication and integration points
3. **Quality**: Testing and code review ensure high standards
4. **Growth**: Learning paths help team members develop skills
5. **Agility**: Iterative development with regular feedback

### Next Steps

1. Review role assignments
2. Set up development environment
3. Complete Week 1 learning objectives
4. Start first sprint
5. Establish communication channels

---

**Last Updated**: March 9, 2026
**Team Size**: 4 developers
**Project**: AgraRide Carpooling Platform
**Version**: 2.0 (Enhanced with theory and best practices)
