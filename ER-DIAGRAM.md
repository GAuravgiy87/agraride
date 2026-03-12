# AgraRide - Entity-Relationship Diagram

## Database Design Documentation

This document provides the Entity-Relationship diagram and database schema for AgraRide.

---

## ER Diagram Overview

### Visual Representation

```
                    ┌──────────────────────────────┐
                    │         USERS                │
                    ├──────────────────────────────┤
                    │ PK: id (INTEGER)             │
                    │     name (TEXT)              │
                    │     email (TEXT) UNIQUE      │
                    │     password (TEXT)          │
                    │     role (TEXT)              │
                    │     phone (TEXT)             │
                    │     gender (TEXT)            │
                    │     vehicle_type (TEXT)      │
                    └──────────────────────────────┘
                              │
                              │ 1
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        │ drives              │ books               │ sends/receives
        │                     │                     │
        │ 1                   │ 1                   │ 1
        │                     │                     │
        ▼ N                   ▼ N                   ▼ N
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     RIDES        │  │    BOOKINGS      │  │    MESSAGES      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PK: id           │  │ PK: id           │  │ PK: id           │
│ FK: driver_id    │  │ FK: ride_id      │  │ FK: ride_id      │
│     origin       │  │ FK: passenger_id │  │ FK: sender_id    │
│     destination  │  │     seats_booked │  │ FK: receiver_id  │
│     departure    │  │     status       │  │     content      │
│     seats        │  │     counter_price│  │     timestamp    │
│     price        │  └──────────────────┘  └──────────────────┘
│     status       │
│     origin_lat   │
│     origin_lng   │
│     dest_lat     │
│     dest_lng     │
└──────────────────┘
        │
        │ 1
        │
        ├──────────────┬──────────────┬──────────────┐
        │              │              │              │
        │ N            │ N            │ N            │ N
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  LOCATIONS   │ │   RATINGS    │ │  SOS_ALERTS  │ │  MESSAGES    │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ PK: id       │ │ PK: id       │ │ PK: id       │ │ PK: id       │
│ FK: ride_id  │ │ FK: ride_id  │ │ FK: ride_id  │ │ FK: ride_id  │
│ FK: user_id  │ │ FK: rater_id │ │ FK: user_id  │ │ FK: sender   │
│   latitude   │ │ FK: rated_id │ │     status   │ │ FK: receiver │
│   longitude  │ │     rating   │ │     timestamp│ │     content  │
│   updated_at │ │     comment  │ └──────────────┘ │     timestamp│
└──────────────┘ │     timestamp│                  └──────────────┘
                 └──────────────┘
```

### Legend
```
PK  = Primary Key
FK  = Foreign Key
1   = One (Cardinality)
N   = Many (Cardinality)
──  = Relationship Line
▼   = Direction of Relationship
```

### Simplified Relationships
```
USERS (1) ──drives──> (N) RIDES
USERS (1) ──books──> (N) BOOKINGS
RIDES (1) ──has──> (N) BOOKINGS
RIDES (1) ──tracks──> (N) LOCATIONS
RIDES (1) ──contains──> (N) MESSAGES
RIDES (1) ──receives──> (N) RATINGS
RIDES (1) ──triggers──> (N) SOS_ALERTS
```

---


## Entity Descriptions

### 1. USERS
Central entity storing all user accounts

**Attributes:**
- `id` - Primary key, auto-increment
- `name` - User's full name
- `email` - Unique email address
- `password` - Password (plain text in dev)
- `role` - 'user' or 'admin'
- `phone` - Contact number
- `gender` - 'male', 'female', 'other'
- `vehicle_type` - 'bike', '4-wheeler', 'scooter'

**Business Rules:**
- Email must be unique
- At least one admin must exist
- Users can be both drivers and passengers

### 2. RIDES
Stores ride offerings from drivers

**Attributes:**
- `id` - Primary key, auto-increment
- `driver_id` - Foreign key to users
- `origin` - Starting location name
- `destination` - Ending location name
- `departure_time` - ISO datetime
- `available_seats` - Number of seats (1-6)
- `price_per_seat` - Price in INR
- `status` - 'active', 'completed', 'cancelled'
- `origin_lat` - Origin GPS latitude
- `origin_lng` - Origin GPS longitude
- `dest_lat` - Destination GPS latitude
- `dest_lng` - Destination GPS longitude

**Business Rules:**
- Driver must be valid user
- Available seats must be positive
- GPS coordinates enable map visualization

### 3. BOOKINGS
Stores passenger booking requests

**Attributes:**
- `id` - Primary key, auto-increment
- `ride_id` - Foreign key to rides
- `passenger_id` - Foreign key to users
- `seats_booked` - Number of seats
- `status` - 'pending', 'confirmed', 'rejected'
- `counter_offer_price` - Optional counter-offer

**Business Rules:**
- One user cannot book same ride twice
- Seats booked ≤ available seats
- Confirmed bookings reduce available seats

### 4. LOCATIONS
Real-time GPS tracking data

**Attributes:**
- `id` - Primary key, auto-increment
- `ride_id` - Foreign key to rides
- `user_id` - Foreign key to users
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `updated_at` - Last update timestamp

**Business Rules:**
- Updates every 3 seconds during ride
- One location record per user per ride
- Used for real-time map visualization

### 5. MESSAGES
In-app chat messages

**Attributes:**
- `id` - Primary key, auto-increment
- `ride_id` - Foreign key to rides
- `sender_id` - Foreign key to users
- `receiver_id` - Foreign key to users
- `content` - Message text
- `timestamp` - Message time

**Business Rules:**
- Messages are ride-specific
- Sender and receiver must be different
- Ordered by timestamp

### 6. RATINGS
User reviews and ratings

**Attributes:**
- `id` - Primary key, auto-increment
- `ride_id` - Foreign key to rides
- `rater_id` - User giving rating
- `rated_user_id` - User being rated
- `rating` - 1-5 stars
- `comment` - Optional review
- `timestamp` - Rating time

**Business Rules:**
- Rating must be 1-5
- One rating per user per ride
- Used to calculate average ratings

### 7. SOS_ALERTS
Emergency alerts

**Attributes:**
- `id` - Primary key, auto-increment
- `ride_id` - Foreign key to rides
- `user_id` - User who triggered
- `status` - 'active', 'resolved'
- `timestamp` - Alert time

**Business Rules:**
- Immediately visible on admin dashboard
- Can be resolved by admin
- Includes ride context

---

## Relationships

### 1. USERS ─drives→ RIDES (1:N)
A user can offer multiple rides as a driver
- Foreign Key: `rides.driver_id` → `users.id`

### 2. USERS ─books→ BOOKINGS (1:N)
A user can make multiple booking requests
- Foreign Key: `bookings.passenger_id` → `users.id`

### 3. RIDES ─has→ BOOKINGS (1:N)
A ride can have multiple booking requests
- Foreign Key: `bookings.ride_id` → `rides.id`

### 4. RIDES ─tracks→ LOCATIONS (1:N)
A ride has multiple location updates
- Foreign Key: `locations.ride_id` → `rides.id`

### 5. USERS ─located_at→ LOCATIONS (1:N)
A user's location tracked across rides
- Foreign Key: `locations.user_id` → `users.id`

### 6. RIDES ─contains→ MESSAGES (1:N)
A ride has conversation thread
- Foreign Key: `messages.ride_id` → `rides.id`

### 7. USERS ─sends→ MESSAGES (1:N)
A user can send multiple messages
- Foreign Key: `messages.sender_id` → `users.id`

### 8. USERS ─receives→ MESSAGES (1:N)
A user can receive multiple messages
- Foreign Key: `messages.receiver_id` → `users.id`

### 9. RIDES ─receives→ RATINGS (1:N)
A ride can have multiple ratings
- Foreign Key: `ratings.ride_id` → `rides.id`

### 10. USERS ─rates→ RATINGS (1:N)
A user can give multiple ratings
- Foreign Key: `ratings.rater_id` → `users.id`

### 11. USERS ─rated_by→ RATINGS (1:N)
A user can receive multiple ratings
- Foreign Key: `ratings.rated_user_id` → `users.id`

### 12. RIDES ─triggers→ SOS_ALERTS (1:N)
A ride can have SOS alerts
- Foreign Key: `sos_alerts.ride_id` → `rides.id`

### 13. USERS ─triggers→ SOS_ALERTS (1:N)
A user can trigger SOS alerts
- Foreign Key: `sos_alerts.user_id` → `users.id`

---

## Database Constraints

### Primary Keys
All tables use auto-incrementing integer primary keys:
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

### Foreign Keys
All relationships enforced with foreign key constraints:
```sql
FOREIGN KEY (column_name) REFERENCES table_name (id)
```

### Unique Constraints
```sql
email TEXT UNIQUE NOT NULL  -- Users table
```

### Check Constraints
```sql
rating INTEGER CHECK (rating >= 1 AND rating <= 5)  -- Ratings table
```

### Default Values
```sql
role TEXT DEFAULT 'user'
status TEXT DEFAULT 'active'
timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## Normalization

### Normal Forms Compliance

**First Normal Form (1NF)** ✓
- All attributes contain atomic values
- No repeating groups
- Each row is unique

**Second Normal Form (2NF)** ✓
- All tables use single-column primary keys
- No partial dependencies

**Third Normal Form (3NF)** ✓
- No transitive dependencies
- Non-key attributes depend only on primary key

---

## Sample Data

### Users
```sql
INSERT INTO users VALUES 
(1, 'Admin User', 'admin@agraride.com', 'admin', 'admin', NULL, NULL, NULL),
(2, 'Rajesh Kumar', 'rajesh@example.com', 'pass123', 'user', '+91 9876543210', 'male', '4-wheeler'),
(3, 'Priya Sharma', 'priya@example.com', 'pass456', 'user', '+91 9876543211', 'female', NULL);
```

### Rides
```sql
INSERT INTO rides VALUES 
(1, 2, 'Dayalbagh', 'Sanjay Place', '2026-03-15T09:00', 3, 50.00, 'active', 
 27.2046, 77.9977, 27.1767, 78.0081);
```

### Bookings
```sql
INSERT INTO bookings VALUES 
(1, 1, 3, 1, 'pending', NULL),
(2, 1, 4, 2, 'confirmed', 45.00);
```

---

**Last Updated**: March 2026
