# ER Diagram - AgraRide

## Entities and Attributes

### 1. Users
- `id` (PK, Integer)
- `name` (String)
- `email` (String, Unique)
- `password` (String)
- `role` (Enum: 'user', 'admin')
- `phone` (String)

### 2. Rides
- `id` (PK, Integer)
- `driver_id` (FK -> Users.id)
- `origin` (String)
- `destination` (String)
- `departure_time` (DateTime)
- `available_seats` (Integer)
- `price_per_seat` (Float)
- `status` (Enum: 'active', 'completed', 'cancelled')

### 3. Bookings
- `id` (PK, Integer)
- `ride_id` (FK -> Rides.id)
- `passenger_id` (FK -> Users.id)
- `seats_booked` (Integer)
- `status` (Enum: 'confirmed', 'cancelled')

### 4. Locations (Live Tracking)
- `id` (PK, Integer)
- `ride_id` (FK -> Rides.id)
- `latitude` (Float)
- `longitude` (Float)
- `updated_at` (DateTime)

## Relationships
- A **User** can host many **Rides** (1:N).
- A **User** can make many **Bookings** (1:N).
- A **Ride** can have many **Bookings** (1:N).
- A **Ride** has one active **Location** update stream (1:1).
