# AgraRide - Entity-Relationship (ER) Diagram

## Complete Database Design Documentation

This document provides a comprehensive Entity-Relationship diagram and detailed analysis of the AgraRide database schema.

---

## Table of Contents
1. [ER Diagram Overview](#er-diagram-overview)
2. [Entity Descriptions](#entity-descriptions)
3. [Relationship Descriptions](#relationship-descriptions)
4. [Cardinality and Participation](#cardinality-and-participation)
5. [Attributes and Constraints](#attributes-and-constraints)
6. [Database Normalization](#database-normalization)
7. [Indexes and Performance](#indexes-and-performance)
8. [Sample Data](#sample-data)

---

## ER Diagram Overview

### Visual Representation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AGRARIDE DATABASE SCHEMA                            │
└─────────────────────────────────────────────────────────────────────────────┘


                    ┌──────────────────────────────┐
                    │         USERS                │
                    │  (Central Entity)            │
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
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     RIDES        │  │    BOOKINGS      │  │    MESSAGES      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PK: id           │  │ PK: id           │  │ PK: id           │
│ FK: driver_id ───┼──┤ FK: ride_id      │  │ FK: ride_id      │
│     origin       │  │ FK: passenger_id │  │ FK: sender_id    │
│     destination  │  │     seats_booked │  │ FK: receiver_id  │
│     departure    │  │     status       │  │     content      │
│     seats        │  │     counter_price│  │     timestamp    │
│     price        │  └──────────────────┘  └──────────────────┘
│     status       │           │
│     origin_lat   │           │ N
│     origin_lng   │           │
│     dest_lat     │           │ belongs to
│     dest_lng     │           │
└──────────────────┘           │ 1
        │                      │
        │ 1                    ▼
        │              ┌──────────────────┐
        │              │     RIDES        │
        │              │  (referenced)    │
        │              └──────────────────┘
        │
        ├──────────────┬──────────────┬──────────────┐
        │ 1            │ 1            │ 1            │ 1
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


### Legend

```
┌─────────────────────────────────────────────────────────────────┐
│  LEGEND                                                          │
├─────────────────────────────────────────────────────────────────┤
│  PK  = Primary Key                                              │
│  FK  = Foreign Key                                              │
│  1   = One (Cardinality)                                        │
│  N   = Many (Cardinality)                                       │
│  ──  = Relationship Line                                        │
│  ▼   = Direction of Relationship                                │
│  UNIQUE = Unique Constraint                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Simplified Relationship Diagram

```
USERS (1) ──drives──> (N) RIDES
USERS (1) ──books──> (N) BOOKINGS
RIDES (1) ──has──> (N) BOOKINGS
RIDES (1) ──tracks──> (N) LOCATIONS
RIDES (1) ──contains──> (N) MESSAGES
RIDES (1) ──receives──> (N) RATINGS
RIDES (1) ──triggers──> (N) SOS_ALERTS
USERS (1) ──sends──> (N) MESSAGES
USERS (1) ──receives──> (N) MESSAGES
USERS (1) ──rates──> (N) RATINGS
USERS (1) ──rated_by──> (N) RATINGS
USERS (1) ──triggers──> (N) SOS_ALERTS
USERS (1) ──located_at──> (N) LOCATIONS
```

---


## Entity Descriptions

### 1. USERS Entity

**Purpose**: Central entity storing all user accounts (drivers, passengers, admins)

**Attributes:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - Unique identifier for each user
  - Auto-generated sequential number
  - Used as foreign key in other tables

- `name` (TEXT, NOT NULL)
  - User's full name
  - Required field
  - Example: "Rajesh Kumar", "Priya Sharma"

- `email` (TEXT, UNIQUE, NOT NULL)
  - User's email address
  - Must be unique across all users
  - Used for login authentication
  - Example: "rajesh@example.com"

- `password` (TEXT, NOT NULL)
  - User's password
  - Currently stored as plain text (development)
  - Should be hashed in production (bcrypt)
  - Example: "password123" → "$2b$10$..."

- `role` (TEXT, DEFAULT 'user')
  - User's role in the system
  - Values: 'user' or 'admin'
  - Determines access permissions
  - Default: 'user'

- `phone` (TEXT, NULLABLE)
  - User's contact number
  - Optional field
  - Example: "+91 9876543210"

- `gender` (TEXT, NULLABLE)
  - User's gender
  - Values: 'male', 'female', 'other'
  - Used for ride matching preferences
  - Optional field

- `vehicle_type` (TEXT, NULLABLE)
  - Type of vehicle user owns
  - Values: 'bike', '4-wheeler', 'scooter'
  - Relevant for drivers
  - Optional field

**Business Rules:**
- Email must be unique (enforced by UNIQUE constraint)
- At least one admin user must exist (seeded on initialization)
- Users can be both drivers and passengers
- Deletion cascades to all related records

**Sample Data:**
```sql
INSERT INTO users VALUES 
(1, 'Admin User', 'admin@agraride.com', 'admin', 'admin', NULL, NULL, NULL),
(2, 'Rajesh Kumar', 'rajesh@example.com', 'pass123', 'user', '+91 9876543210', 'male', '4-wheeler'),
(3, 'Priya Sharma', 'priya@example.com', 'pass456', 'user', '+91 9876543211', 'female', NULL);
```

---


### 2. RIDES Entity

**Purpose**: Stores ride offerings created by drivers

**Attributes:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - Unique identifier for each ride
  - Auto-generated sequential number

- `driver_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user who created the ride
  - Must be a valid user ID
  - Establishes driver-ride relationship

- `origin` (TEXT, NOT NULL)
  - Starting location name
  - Example: "Dayalbagh", "Taj Mahal"
  - Human-readable address

- `destination` (TEXT, NOT NULL)
  - Ending location name
  - Example: "Sanjay Place", "Agra Fort"
  - Human-readable address

- `departure_time` (TEXT, NOT NULL)
  - Scheduled departure date and time
  - Format: ISO 8601 (YYYY-MM-DDTHH:MM)
  - Example: "2026-03-15T09:00"

- `available_seats` (INTEGER, NOT NULL)
  - Number of seats available for booking
  - Range: 1-6 (typically)
  - Decreases when bookings are confirmed

- `price_per_seat` (REAL, NOT NULL)
  - Cost per seat in INR (₹)
  - Example: 50.00, 100.00
  - Can be negotiated via counter-offers

- `status` (TEXT, DEFAULT 'active')
  - Current status of the ride
  - Values: 'active', 'completed', 'cancelled'
  - Default: 'active'

- `origin_lat` (REAL, NULLABLE)
  - Latitude of origin location
  - GPS coordinate
  - Example: 27.2046

- `origin_lng` (REAL, NULLABLE)
  - Longitude of origin location
  - GPS coordinate
  - Example: 77.9977

- `dest_lat` (REAL, NULLABLE)
  - Latitude of destination location
  - GPS coordinate
  - Example: 27.1767

- `dest_lng` (REAL, NULLABLE)
  - Longitude of destination location
  - GPS coordinate
  - Example: 78.0081

**Business Rules:**
- Driver must be a valid user
- Available seats must be positive
- Price must be positive
- Departure time should be in the future (not enforced at DB level)
- GPS coordinates enable map visualization
- Status changes: active → completed/cancelled

**Sample Data:**
```sql
INSERT INTO rides VALUES 
(1, 2, 'Dayalbagh', 'Sanjay Place', '2026-03-15T09:00', 3, 50.00, 'active', 
 27.2046, 77.9977, 27.1767, 78.0081),
(2, 2, 'Taj Mahal', 'Agra Fort', '2026-03-15T14:00', 2, 30.00, 'active',
 27.1751, 78.0421, 27.1795, 78.0211);
```

---


### 3. BOOKINGS Entity

**Purpose**: Stores passenger booking requests and confirmations

**Attributes:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - Unique identifier for each booking

- `ride_id` (INTEGER, FOREIGN KEY → rides.id)
  - References the ride being booked
  - Must be a valid ride ID

- `passenger_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user making the booking
  - Must be a valid user ID

- `seats_booked` (INTEGER, NOT NULL)
  - Number of seats requested
  - Must be ≤ available_seats in ride
  - Typically 1-2 seats

- `status` (TEXT, DEFAULT 'pending')
  - Current status of booking
  - Values: 'pending', 'confirmed', 'rejected', 'cancelled'
  - Default: 'pending'
  - Workflow: pending → confirmed/rejected

- `counter_offer_price` (REAL, NULLABLE)
  - Passenger's proposed price per seat
  - Optional negotiation feature
  - If NULL, accepts original price
  - Example: Original ₹50, Counter-offer ₹40

**Business Rules:**
- One user cannot book the same ride multiple times (enforced in API)
- Seats booked must not exceed available seats
- Counter-offer must be positive if provided
- Confirmed bookings reduce available seats in ride
- Rejected/cancelled bookings don't affect seat count

**Sample Data:**
```sql
INSERT INTO bookings VALUES 
(1, 1, 3, 1, 'pending', NULL),
(2, 1, 4, 2, 'confirmed', 45.00),
(3, 2, 3, 1, 'rejected', NULL);
```

---

### 4. LOCATIONS Entity

**Purpose**: Stores real-time GPS coordinates for live tracking

**Attributes:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - Unique identifier for each location record

- `ride_id` (INTEGER, FOREIGN KEY → rides.id)
  - References the ride being tracked
  - Must be a valid ride ID

- `user_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user whose location is tracked
  - Typically the driver, but can be passengers
  - Must be a valid user ID

- `latitude` (REAL, NOT NULL)
  - Current GPS latitude
  - Range: -90 to +90
  - Example: 27.1850

- `longitude` (REAL, NOT NULL)
  - Current GPS longitude
  - Range: -180 to +180
  - Example: 78.0150

- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
  - Timestamp of last location update
  - Auto-updated on INSERT/UPDATE
  - Used to determine freshness of data

**Business Rules:**
- One location record per user per ride (upsert pattern)
- Updates every 3 seconds during active ride
- Deleted after ride completion (optional)
- Used for real-time map visualization

**Sample Data:**
```sql
INSERT INTO locations VALUES 
(1, 1, 2, 27.1900, 78.0050, '2026-03-15 09:15:30'),
(2, 1, 3, 27.1905, 78.0055, '2026-03-15 09:15:32');
```

---


### 5. MESSAGES Entity

**Purpose**: Stores in-app chat messages between users

**Attributes:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - Unique identifier for each message

- `ride_id` (INTEGER, FOREIGN KEY → rides.id)
  - References the ride context
  - Messages are ride-specific
  - Must be a valid ride ID

- `sender_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user sending the message
  - Must be a valid user ID

- `receiver_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user receiving the message
  - Must be a valid user ID

- `content` (TEXT, NOT NULL)
  - Message text content
  - No length limit
  - Example: "Hi! I'm interested in your ride."

- `timestamp` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
  - When message was sent
  - Auto-generated on INSERT
  - Used for chronological ordering

**Business Rules:**
- Sender and receiver must be different users
- Both users must be associated with the ride
- Messages are permanent (no deletion feature)
- Ordered by timestamp for display

**Sample Data:**
```sql
INSERT INTO messages VALUES 
(1, 1, 3, 2, 'Hi! Is this ride still available?', '2026-03-14 10:30:00'),
(2, 1, 2, 3, 'Yes, you can book it!', '2026-03-14 10:31:00'),
(3, 1, 3, 2, 'Great! I will book 1 seat.', '2026-03-14 10:32:00');
```

---

### 6. RATINGS Entity

**Purpose**: Stores user reviews and ratings after completed rides

**Attributes:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - Unique identifier for each rating

- `ride_id` (INTEGER, FOREIGN KEY → rides.id)
  - References the completed ride
  - Must be a valid ride ID

- `rater_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user giving the rating
  - Must be a valid user ID

- `rated_user_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user being rated
  - Must be a valid user ID

- `rating` (INTEGER, NOT NULL, CHECK rating >= 1 AND rating <= 5)
  - Star rating value
  - Range: 1-5 stars
  - Constraint enforced at database level

- `comment` (TEXT, NULLABLE)
  - Optional written review
  - Example: "Great driver, very punctual!"

- `timestamp` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
  - When rating was submitted
  - Auto-generated on INSERT

**Business Rules:**
- Rating must be between 1 and 5 (enforced by CHECK constraint)
- Rater and rated user must be different
- Both must be associated with the ride
- One rating per user per ride (enforced in API)
- Used to calculate average ratings

**Sample Data:**
```sql
INSERT INTO ratings VALUES 
(1, 1, 3, 2, 5, 'Excellent driver! Very safe and punctual.', '2026-03-15 10:30:00'),
(2, 1, 2, 3, 4, 'Good passenger, on time.', '2026-03-15 10:35:00');
```

---


### 7. SOS_ALERTS Entity

**Purpose**: Stores emergency alert triggers for safety

**Attributes:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - Unique identifier for each alert

- `ride_id` (INTEGER, FOREIGN KEY → rides.id)
  - References the ride where alert was triggered
  - Must be a valid ride ID

- `user_id` (INTEGER, FOREIGN KEY → users.id)
  - References the user who triggered the alert
  - Can be driver or passenger
  - Must be a valid user ID

- `status` (TEXT, DEFAULT 'active')
  - Current status of the alert
  - Values: 'active', 'resolved'
  - Default: 'active'

- `timestamp` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
  - When alert was triggered
  - Auto-generated on INSERT
  - Critical for emergency response time

**Business Rules:**
- Immediately visible on admin dashboard
- Includes ride and user details for context
- Can be resolved by admin
- Triggers notifications (future enhancement)
- Should be rare (indicates emergency)

**Sample Data:**
```sql
INSERT INTO sos_alerts VALUES 
(1, 1, 3, 'active', '2026-03-15 09:45:00');
```

---

## Relationship Descriptions

### 1. USERS ─drives→ RIDES
**Type**: One-to-Many (1:N)
**Description**: A user can offer multiple rides as a driver

**Cardinality:**
- One user can create 0 or more rides
- Each ride must have exactly one driver

**Foreign Key**: `rides.driver_id` → `users.id`

**Business Logic:**
- User with `vehicle_type` typically offers rides
- Driver can edit/delete their own rides
- Driver receives booking requests

**SQL Constraint:**
```sql
FOREIGN KEY (driver_id) REFERENCES users (id)
```

---

### 2. USERS ─books→ BOOKINGS
**Type**: One-to-Many (1:N)
**Description**: A user can make multiple booking requests as a passenger

**Cardinality:**
- One user can create 0 or more bookings
- Each booking must have exactly one passenger

**Foreign Key**: `bookings.passenger_id` → `users.id`

**Business Logic:**
- User can book multiple different rides
- Cannot book same ride twice (enforced in API)
- Can make counter-offers on price

**SQL Constraint:**
```sql
FOREIGN KEY (passenger_id) REFERENCES users (id)
```

---

### 3. RIDES ─has→ BOOKINGS
**Type**: One-to-Many (1:N)
**Description**: A ride can have multiple booking requests

**Cardinality:**
- One ride can have 0 or more bookings
- Each booking belongs to exactly one ride

**Foreign Key**: `bookings.ride_id` → `rides.id`

**Business Logic:**
- Multiple passengers can book same ride
- Total confirmed seats ≤ available seats
- Pending bookings don't affect seat count

**SQL Constraint:**
```sql
FOREIGN KEY (ride_id) REFERENCES rides (id)
```

---


### 4. RIDES ─tracks→ LOCATIONS
**Type**: One-to-Many (1:N)
**Description**: A ride has multiple location updates for tracking

**Cardinality:**
- One ride can have 0 or more location records
- Each location record belongs to exactly one ride

**Foreign Key**: `locations.ride_id` → `rides.id`

**Business Logic:**
- Location updates every 3 seconds during active ride
- Multiple users (driver + passengers) can be tracked
- Used for real-time map visualization

**SQL Constraint:**
```sql
FOREIGN KEY (ride_id) REFERENCES rides (id)
```

---

### 5. USERS ─located_at→ LOCATIONS
**Type**: One-to-Many (1:N)
**Description**: A user's location is tracked across multiple rides

**Cardinality:**
- One user can have 0 or more location records
- Each location record belongs to exactly one user

**Foreign Key**: `locations.user_id` → `users.id`

**Business Logic:**
- Typically driver's location is tracked
- Passengers can also share location (optional)
- One location record per user per ride (upsert)

**SQL Constraint:**
```sql
FOREIGN KEY (user_id) REFERENCES users (id)
```

---

### 6. RIDES ─contains→ MESSAGES
**Type**: One-to-Many (1:N)
**Description**: A ride has a conversation thread with multiple messages

**Cardinality:**
- One ride can have 0 or more messages
- Each message belongs to exactly one ride

**Foreign Key**: `messages.ride_id` → `rides.id`

**Business Logic:**
- Messages are ride-specific
- Used for coordination between driver and passengers
- Chronologically ordered by timestamp

**SQL Constraint:**
```sql
FOREIGN KEY (ride_id) REFERENCES rides (id)
```

---

### 7. USERS ─sends→ MESSAGES
**Type**: One-to-Many (1:N)
**Description**: A user can send multiple messages

**Cardinality:**
- One user can send 0 or more messages
- Each message has exactly one sender

**Foreign Key**: `messages.sender_id` → `users.id`

**Business Logic:**
- User can message other users in same ride
- Messages are permanent
- Used for ride coordination

**SQL Constraint:**
```sql
FOREIGN KEY (sender_id) REFERENCES users (id)
```

---

### 8. USERS ─receives→ MESSAGES
**Type**: One-to-Many (1:N)
**Description**: A user can receive multiple messages

**Cardinality:**
- One user can receive 0 or more messages
- Each message has exactly one receiver

**Foreign Key**: `messages.receiver_id` → `users.id`

**Business Logic:**
- User receives messages from other users
- Inbox shows all conversations
- Messages grouped by ride

**SQL Constraint:**
```sql
FOREIGN KEY (receiver_id) REFERENCES users (id)
```

---


### 9. RIDES ─receives→ RATINGS
**Type**: One-to-Many (1:N)
**Description**: A ride can have multiple ratings from participants

**Cardinality:**
- One ride can have 0 or more ratings
- Each rating belongs to exactly one ride

**Foreign Key**: `ratings.ride_id` → `rides.id`

**Business Logic:**
- Ratings submitted after ride completion
- Both driver and passengers can rate each other
- Used for reputation system

**SQL Constraint:**
```sql
FOREIGN KEY (ride_id) REFERENCES rides (id)
```

---

### 10. USERS ─rates→ RATINGS (as rater)
**Type**: One-to-Many (1:N)
**Description**: A user can give multiple ratings to other users

**Cardinality:**
- One user can give 0 or more ratings
- Each rating has exactly one rater

**Foreign Key**: `ratings.rater_id` → `users.id`

**Business Logic:**
- User rates other participants after ride
- One rating per user per ride
- Contributes to rated user's average rating

**SQL Constraint:**
```sql
FOREIGN KEY (rater_id) REFERENCES users (id)
```

---

### 11. USERS ─rated_by→ RATINGS (as rated user)
**Type**: One-to-Many (1:N)
**Description**: A user can receive multiple ratings from other users

**Cardinality:**
- One user can receive 0 or more ratings
- Each rating is for exactly one user

**Foreign Key**: `ratings.rated_user_id` → `users.id`

**Business Logic:**
- User accumulates ratings over time
- Average rating displayed on profile
- Influences trust and booking decisions

**SQL Constraint:**
```sql
FOREIGN KEY (rated_user_id) REFERENCES users (id)
```

---

### 12. RIDES ─triggers→ SOS_ALERTS
**Type**: One-to-Many (1:N)
**Description**: A ride can have multiple SOS alerts (rare)

**Cardinality:**
- One ride can have 0 or more SOS alerts
- Each alert belongs to exactly one ride

**Foreign Key**: `sos_alerts.ride_id` → `rides.id`

**Business Logic:**
- Emergency alerts during ride
- Visible on admin dashboard
- Includes ride context for response

**SQL Constraint:**
```sql
FOREIGN KEY (ride_id) REFERENCES rides (id)
```

---

### 13. USERS ─triggers→ SOS_ALERTS
**Type**: One-to-Many (1:N)
**Description**: A user can trigger multiple SOS alerts across rides

**Cardinality:**
- One user can trigger 0 or more alerts
- Each alert is triggered by exactly one user

**Foreign Key**: `sos_alerts.user_id` → `users.id`

**Business Logic:**
- Any participant can trigger alert
- Identifies who needs help
- Admin can contact user directly

**SQL Constraint:**
```sql
FOREIGN KEY (user_id) REFERENCES users (id)
```

---


## Cardinality and Participation

### Cardinality Summary Table

| Relationship | Entity 1 | Cardinality | Entity 2 | Participation |
|--------------|----------|-------------|----------|---------------|
| Drives | USERS | 1 | RIDES | N | Optional (0..N) |
| Books | USERS | 1 | BOOKINGS | N | Optional (0..N) |
| Has Bookings | RIDES | 1 | BOOKINGS | N | Optional (0..N) |
| Tracks | RIDES | 1 | LOCATIONS | N | Optional (0..N) |
| Located At | USERS | 1 | LOCATIONS | N | Optional (0..N) |
| Contains Messages | RIDES | 1 | MESSAGES | N | Optional (0..N) |
| Sends | USERS | 1 | MESSAGES | N | Optional (0..N) |
| Receives | USERS | 1 | MESSAGES | N | Optional (0..N) |
| Receives Ratings | RIDES | 1 | RATINGS | N | Optional (0..N) |
| Rates (Rater) | USERS | 1 | RATINGS | N | Optional (0..N) |
| Rated By | USERS | 1 | RATINGS | N | Optional (0..N) |
| Triggers Alerts | RIDES | 1 | SOS_ALERTS | N | Optional (0..N) |
| Triggers Alerts | USERS | 1 | SOS_ALERTS | N | Optional (0..N) |

### Participation Constraints

**Total Participation (Mandatory):**
- Every RIDE must have a driver (driver_id NOT NULL)
- Every BOOKING must have a ride and passenger (both NOT NULL)
- Every LOCATION must have a ride and user (both NOT NULL)
- Every MESSAGE must have sender and receiver (both NOT NULL)
- Every RATING must have rater and rated user (both NOT NULL)
- Every SOS_ALERT must have ride and user (both NOT NULL)

**Partial Participation (Optional):**
- A USER may not have any rides (can be passenger only)
- A USER may not have any bookings (can be driver only)
- A RIDE may not have any bookings (no passengers yet)
- A RIDE may not have any messages (no communication)
- A RIDE may not have any ratings (not completed yet)
- A RIDE may not have any SOS alerts (normal operation)

---

## Attributes and Constraints

### Primary Keys
All entities use auto-incrementing integer primary keys:
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

**Benefits:**
- Simple and efficient
- Guaranteed uniqueness
- Sequential ordering
- Small storage footprint

### Foreign Keys
All relationships enforced with foreign key constraints:
```sql
FOREIGN KEY (column_name) REFERENCES table_name (id)
```

**Benefits:**
- Referential integrity
- Prevents orphaned records
- Enables cascade operations
- Database-level validation

### Unique Constraints
```sql
-- Users table
email TEXT UNIQUE NOT NULL
```

**Purpose:**
- Prevents duplicate email addresses
- Ensures one account per email
- Used for login authentication

### Check Constraints
```sql
-- Ratings table
rating INTEGER CHECK (rating >= 1 AND rating <= 5)
```

**Purpose:**
- Validates rating range
- Prevents invalid data
- Database-level validation

### Default Values
```sql
-- Users table
role TEXT DEFAULT 'user'

-- Rides table
status TEXT DEFAULT 'active'

-- Bookings table
status TEXT DEFAULT 'pending'

-- Timestamps
timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Purpose:**
- Automatic value assignment
- Reduces application logic
- Ensures consistency

### NOT NULL Constraints
Applied to essential fields:
- All primary keys
- All foreign keys
- Core business fields (name, email, password, origin, destination, etc.)

**Purpose:**
- Data integrity
- Prevents incomplete records
- Forces explicit values

---


## Database Normalization

### Normal Forms Analysis

#### First Normal Form (1NF) ✓
**Requirements:**
- All attributes contain atomic values
- No repeating groups
- Each row is unique

**Compliance:**
- ✓ All columns contain single values
- ✓ No arrays or lists in columns
- ✓ Primary keys ensure uniqueness

**Example:**
```sql
-- CORRECT (1NF compliant)
users: id, name, email, phone

-- INCORRECT (violates 1NF)
users: id, name, emails (comma-separated list)
```

#### Second Normal Form (2NF) ✓
**Requirements:**
- Must be in 1NF
- No partial dependencies on composite keys

**Compliance:**
- ✓ All tables use single-column primary keys
- ✓ No composite keys exist
- ✓ All non-key attributes depend on entire primary key

**Example:**
```sql
-- CORRECT (2NF compliant)
bookings: id, ride_id, passenger_id, seats_booked

-- INCORRECT (partial dependency)
bookings: (ride_id, passenger_id), seats_booked, ride_origin
-- ride_origin depends only on ride_id, not full key
```

#### Third Normal Form (3NF) ✓
**Requirements:**
- Must be in 2NF
- No transitive dependencies

**Compliance:**
- ✓ Non-key attributes depend only on primary key
- ✓ No attribute depends on another non-key attribute

**Example:**
```sql
-- CORRECT (3NF compliant)
rides: id, driver_id, origin, destination
users: id, name, email

-- INCORRECT (transitive dependency)
rides: id, driver_id, driver_name, driver_email
-- driver_name and driver_email depend on driver_id, not ride.id
```

#### Boyce-Codd Normal Form (BCNF) ✓
**Requirements:**
- Must be in 3NF
- Every determinant is a candidate key

**Compliance:**
- ✓ All functional dependencies have primary key as determinant
- ✓ No anomalies in current schema

### Denormalization Decisions

**Intentional Denormalization:**
None currently. All data is properly normalized.

**Future Considerations:**
For performance optimization, could denormalize:
- Driver name in rides table (avoid JOIN)
- Average rating in users table (avoid calculation)
- Passenger count in rides table (avoid COUNT)

**Trade-offs:**
- Faster reads (no JOINs needed)
- Slower writes (must update multiple places)
- Risk of data inconsistency
- Increased storage

---

## Indexes and Performance

### Recommended Indexes

```sql
-- Primary key indexes (automatic)
CREATE INDEX idx_users_pk ON users(id);
CREATE INDEX idx_rides_pk ON rides(id);
CREATE INDEX idx_bookings_pk ON bookings(id);
CREATE INDEX idx_locations_pk ON locations(id);
CREATE INDEX idx_messages_pk ON messages(id);
CREATE INDEX idx_ratings_pk ON ratings(id);
CREATE INDEX idx_sos_alerts_pk ON sos_alerts(id);

-- Foreign key indexes (for JOIN performance)
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX idx_locations_ride_id ON locations(ride_id);
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_messages_ride_id ON messages(ride_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_ratings_ride_id ON ratings(ride_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX idx_sos_alerts_ride_id ON sos_alerts(ride_id);
CREATE INDEX idx_sos_alerts_user_id ON sos_alerts(user_id);

-- Unique constraint indexes (automatic)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Query optimization indexes
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX idx_rides_departure_time ON rides(departure_time);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_ratings_timestamp ON ratings(timestamp);

-- Composite indexes for common queries
CREATE INDEX idx_bookings_ride_passenger ON bookings(ride_id, passenger_id);
CREATE INDEX idx_locations_ride_user ON locations(ride_id, user_id);
```

### Index Benefits

**Query Performance:**
```sql
-- Without index: Full table scan O(n)
SELECT * FROM rides WHERE status = 'active';

-- With index: Index seek O(log n)
-- Uses idx_rides_status
```

**JOIN Performance:**
```sql
-- Without index: Nested loop O(n*m)
SELECT r.*, u.name 
FROM rides r 
JOIN users u ON r.driver_id = u.id;

-- With index: Index lookup O(n log m)
-- Uses idx_rides_driver_id
```

**Storage Cost:**
- Each index adds ~10-20% to table size
- Trade-off: Faster reads, slower writes
- Worth it for frequently queried columns

---


## Sample Data

### Complete Database Population

```sql
-- ========================================
-- USERS TABLE
-- ========================================
INSERT INTO users (id, name, email, password, role, phone, gender, vehicle_type) VALUES
(1, 'System Admin', 'admin@agraride.com', 'admin', 'admin', NULL, NULL, NULL),
(2, 'Rajesh Kumar', 'rajesh@example.com', 'pass123', 'user', '+91 9876543210', 'male', '4-wheeler'),
(3, 'Priya Sharma', 'priya@example.com', 'pass456', 'user', '+91 9876543211', 'female', NULL),
(4, 'Amit Singh', 'amit@example.com', 'pass789', 'user', '+91 9876543212', 'male', 'bike'),
(5, 'Neha Gupta', 'neha@example.com', 'pass101', 'user', '+91 9876543213', 'female', '4-wheeler');

-- ========================================
-- RIDES TABLE
-- ========================================
INSERT INTO rides (id, driver_id, origin, destination, departure_time, available_seats, price_per_seat, status, origin_lat, origin_lng, dest_lat, dest_lng) VALUES
(1, 2, 'Dayalbagh', 'Sanjay Place', '2026-03-15T09:00', 3, 50.00, 'active', 27.2046, 77.9977, 27.1767, 78.0081),
(2, 2, 'Taj Mahal', 'Agra Fort', '2026-03-15T14:00', 2, 30.00, 'active', 27.1751, 78.0421, 27.1795, 78.0211),
(3, 4, 'Sikandra', 'Agra Cantt', '2026-03-16T08:00', 1, 25.00, 'active', 27.2152, 77.9086, 27.1592, 78.0458),
(4, 5, 'Fatehpur Sikri', 'Taj Mahal', '2026-03-16T10:00', 4, 100.00, 'active', 27.0945, 77.6611, 27.1751, 78.0421),
(5, 2, 'Agra Fort', 'Dayalbagh', '2026-03-14T18:00', 2, 40.00, 'completed', 27.1795, 78.0211, 27.2046, 77.9977);

-- ========================================
-- BOOKINGS TABLE
-- ========================================
INSERT INTO bookings (id, ride_id, passenger_id, seats_booked, status, counter_offer_price) VALUES
(1, 1, 3, 1, 'pending', NULL),
(2, 1, 4, 2, 'confirmed', 45.00),
(3, 2, 3, 1, 'rejected', NULL),
(4, 3, 3, 1, 'confirmed', NULL),
(5, 4, 2, 2, 'pending', 90.00),
(6, 5, 3, 1, 'confirmed', NULL);

-- ========================================
-- LOCATIONS TABLE
-- ========================================
INSERT INTO locations (id, ride_id, user_id, latitude, longitude, updated_at) VALUES
(1, 1, 2, 27.1900, 78.0050, '2026-03-15 09:15:30'),
(2, 1, 4, 27.1905, 78.0055, '2026-03-15 09:15:32'),
(3, 3, 4, 27.1800, 77.9500, '2026-03-16 08:20:00'),
(4, 3, 3, 27.1805, 77.9505, '2026-03-16 08:20:02');

-- ========================================
-- MESSAGES TABLE
-- ========================================
INSERT INTO messages (id, ride_id, sender_id, receiver_id, content, timestamp) VALUES
(1, 1, 3, 2, 'Hi! Is this ride still available?', '2026-03-14 10:30:00'),
(2, 1, 2, 3, 'Yes, you can book it!', '2026-03-14 10:31:00'),
(3, 1, 3, 2, 'Great! I will book 1 seat.', '2026-03-14 10:32:00'),
(4, 1, 4, 2, 'Can I book 2 seats for ₹45 each?', '2026-03-14 11:00:00'),
(5, 1, 2, 4, 'Sure, that works for me!', '2026-03-14 11:05:00'),
(6, 4, 2, 5, 'Is pickup from Fatehpur Sikri gate?', '2026-03-15 15:00:00'),
(7, 4, 5, 2, 'Yes, main gate at 10 AM sharp.', '2026-03-15 15:10:00');

-- ========================================
-- RATINGS TABLE
-- ========================================
INSERT INTO ratings (id, ride_id, rater_id, rated_user_id, rating, comment, timestamp) VALUES
(1, 5, 3, 2, 5, 'Excellent driver! Very safe and punctual.', '2026-03-14 19:00:00'),
(2, 5, 2, 3, 4, 'Good passenger, on time.', '2026-03-14 19:05:00'),
(3, 3, 3, 4, 5, 'Great ride on bike, very careful driver.', '2026-03-16 09:00:00'),
(4, 3, 4, 3, 5, 'Perfect passenger!', '2026-03-16 09:05:00');

-- ========================================
-- SOS_ALERTS TABLE
-- ========================================
INSERT INTO sos_alerts (id, ride_id, user_id, status, timestamp) VALUES
(1, 1, 3, 'resolved', '2026-03-15 09:45:00');
```

### Query Examples

#### 1. Get all active rides with driver details
```sql
SELECT 
    r.id,
    r.origin,
    r.destination,
    r.departure_time,
    r.available_seats,
    r.price_per_seat,
    u.name as driver_name,
    u.phone as driver_phone,
    u.gender as driver_gender,
    u.vehicle_type
FROM rides r
JOIN users u ON r.driver_id = u.id
WHERE r.status = 'active'
ORDER BY r.departure_time ASC;
```

#### 2. Get pending booking requests for a driver
```sql
SELECT 
    b.id,
    b.seats_booked,
    b.counter_offer_price,
    r.origin,
    r.destination,
    r.price_per_seat,
    u.name as passenger_name,
    u.phone as passenger_phone,
    u.gender as passenger_gender
FROM bookings b
JOIN rides r ON b.ride_id = r.id
JOIN users u ON b.passenger_id = u.id
WHERE r.driver_id = 2 
  AND b.status = 'pending'
ORDER BY b.id DESC;
```

#### 3. Get user's average rating
```sql
SELECT 
    u.name,
    COUNT(r.id) as total_ratings,
    AVG(r.rating) as average_rating,
    MIN(r.rating) as lowest_rating,
    MAX(r.rating) as highest_rating
FROM users u
LEFT JOIN ratings r ON u.id = r.rated_user_id
WHERE u.id = 2
GROUP BY u.id, u.name;
```

#### 4. Get real-time locations for a ride
```sql
SELECT 
    l.latitude,
    l.longitude,
    l.updated_at,
    u.name as user_name,
    u.id as user_id
FROM locations l
JOIN users u ON l.user_id = u.id
WHERE l.ride_id = 1
ORDER BY l.updated_at DESC;
```

#### 5. Get conversation history for a ride
```sql
SELECT 
    m.content,
    m.timestamp,
    sender.name as sender_name,
    receiver.name as receiver_name
FROM messages m
JOIN users sender ON m.sender_id = sender.id
JOIN users receiver ON m.receiver_id = receiver.id
WHERE m.ride_id = 1
ORDER BY m.timestamp ASC;
```

#### 6. Get active SOS alerts with details
```sql
SELECT 
    s.id,
    s.timestamp,
    u.name as user_name,
    u.phone as user_phone,
    r.origin,
    r.destination,
    driver.name as driver_name,
    driver.phone as driver_phone
FROM sos_alerts s
JOIN users u ON s.user_id = u.id
JOIN rides r ON s.ride_id = r.id
JOIN users driver ON r.driver_id = driver.id
WHERE s.status = 'active'
ORDER BY s.timestamp DESC;
```

---

