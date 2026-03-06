# AgraRide ER Diagram - Complete Explanation

## Overview
The ER diagram represents the complete database schema for the AgraRide carpooling system with 7 entities and 11 relationships.

## Entities (Tables)

### 1. USERS
**Primary Key:** id
**Attributes:**
- id (PK) - Unique identifier
- name - User's full name
- email - User's email (unique)
- password - Encrypted password
- phone - Contact number
- gender - User's gender
- vehicle_type - Type of vehicle (2-wheeler/4-wheeler)
- role - User role (user/admin)

### 2. RIDES
**Primary Key:** id
**Foreign Keys:** driver_id → USERS(id)
**Attributes:**
- id (PK) - Unique identifier
- driver_id (FK) - Reference to driver
- origin - Starting location name
- destination - Ending location name
- origin_lat - Origin latitude coordinate
- origin_lng - Origin longitude coordinate
- dest_lat - Destination latitude coordinate
- dest_lng - Destination longitude coordinate
- departure_time - Scheduled departure
- available_seats - Number of seats available
- price_per_seat - Cost per seat
- status - Ride status (active/completed)

### 3. BOOKINGS
**Primary Key:** id
**Foreign Keys:** ride_id → RIDES(id), passenger_id → USERS(id)
**Attributes:**
- id (PK) - Unique identifier
- ride_id (FK) - Reference to ride
- passenger_id (FK) - Reference to passenger
- seats_booked - Number of seats booked
- status - Booking status (pending/confirmed/rejected)
- counter_offer_price - Counter offer amount

### 4. LOCATIONS
**Primary Key:** id
**Foreign Keys:** ride_id → RIDES(id), user_id → USERS(id)
**Attributes:**
- id (PK) - Unique identifier
- ride_id (FK) - Reference to ride
- user_id (FK) - Reference to user
- latitude - Current latitude
- longitude - Current longitude
- updated_at - Last update timestamp

### 5. MESSAGES
**Primary Key:** id
**Foreign Keys:** ride_id → RIDES(id), sender_id → USERS(id), receiver_id → USERS(id)
**Attributes:**
- id (PK) - Unique identifier
- ride_id (FK) - Reference to ride
- sender_id (FK) - Message sender
- receiver_id (FK) - Message receiver
- content - Message text
- timestamp - Message time

### 6. RATINGS
**Primary Key:** id
**Foreign Keys:** ride_id → RIDES(id), rater_id → USERS(id), rated_user_id → USERS(id)
**Attributes:**
- id (PK) - Unique identifier
- ride_id (FK) - Reference to ride
- rater_id (FK) - User giving rating
- rated_user_id (FK) - User being rated
- rating - Rating value (1-5)
- comment - Rating comment
- timestamp - Rating time

### 7. SOS_ALERTS
**Primary Key:** id
**Foreign Keys:** ride_id → RIDES(id), user_id → USERS(id)
**Attributes:**
- id (PK) - Unique identifier
- ride_id (FK) - Reference to ride
- user_id (FK) - User triggering alert
- status - Alert status (active/resolved)
- timestamp - Alert time

## Relationships

### 1. OFFERS (USERS → RIDES)
**Cardinality:** 1:N (One-to-Many)
- One user can offer many rides
- Each ride is offered by exactly one driver
- Relationship Type: Identifying

### 2. BOOKS (USERS → BOOKINGS)
**Cardinality:** 1:N (One-to-Many)
- One user can make many bookings
- Each booking belongs to exactly one passenger
- Relationship Type: Identifying

### 3. HAS (RIDES → BOOKINGS)
**Cardinality:** 1:N (One-to-Many)
- One ride can have many bookings
- Each booking is for exactly one ride
- Relationship Type: Identifying

### 4. TRACKS (RIDES → LOCATIONS)
**Cardinality:** 1:N (One-to-Many)
- One ride can have many location updates
- Each location belongs to exactly one ride
- Relationship Type: Identifying

### 5. SHARES (USERS → LOCATIONS)
**Cardinality:** 1:N (One-to-Many)
- One user can share many locations
- Each location is shared by exactly one user
- Relationship Type: Identifying

### 6. SENDS (USERS → MESSAGES)
**Cardinality:** 1:N (One-to-Many)
- One user can send many messages
- Each message has exactly one sender
- Relationship Type: Identifying

### 7. RECEIVES (USERS → MESSAGES)
**Cardinality:** 1:N (One-to-Many)
- One user can receive many messages
- Each message has exactly one receiver
- Relationship Type: Identifying

### 8. CONTAINS (RIDES → MESSAGES)
**Cardinality:** 1:N (One-to-Many)
- One ride can contain many messages
- Each message belongs to exactly one ride
- Relationship Type: Identifying

### 9. GIVES (USERS → RATINGS)
**Cardinality:** 1:N (One-to-Many)
- One user can give many ratings
- Each rating has exactly one rater
- Relationship Type: Identifying

### 10. RECEIVES_RATING (USERS → RATINGS)
**Cardinality:** 1:N (One-to-Many)
- One user can receive many ratings
- Each rating has exactly one rated user
- Relationship Type: Identifying

### 11. FOR_RIDE (RIDES → RATINGS)
**Cardinality:** 1:N (One-to-Many)
- One ride can have many ratings
- Each rating is for exactly one ride
- Relationship Type: Identifying

### 12. TRIGGERS (USERS → SOS_ALERTS)
**Cardinality:** 1:N (One-to-Many)
- One user can trigger many SOS alerts
- Each alert is triggered by exactly one user
- Relationship Type: Identifying

### 13. ALERTS_FOR (RIDES → SOS_ALERTS)
**Cardinality:** 1:N (One-to-Many)
- One ride can have many SOS alerts
- Each alert is for exactly one ride
- Relationship Type: Identifying

## Key Design Decisions

1. **Normalized Design**: All relationships are 1:N, avoiding many-to-many relationships
2. **Coordinate Storage**: Rides store both location names and GPS coordinates for accuracy
3. **Dual User References**: Messages and Ratings reference users twice (sender/receiver, rater/rated)
4. **Status Tracking**: Multiple entities track status (rides, bookings, SOS alerts)
5. **Timestamps**: Time-sensitive entities include timestamp fields
6. **Cascade Deletes**: Foreign keys enable cascade deletion for data integrity

## Database Statistics
- **Total Entities**: 7
- **Total Relationships**: 13 (11 unique relationship types)
- **Total Foreign Keys**: 15
- **Relationship Types**: All 1:N (One-to-Many)
- **Primary Keys**: 7 (one per entity)
