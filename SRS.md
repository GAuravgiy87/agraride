# Software Requirements Specification (SRS) - AgraRide

## 1. Introduction
AgraRide is a carpooling application designed specifically for the city of Agra, India. It aims to reduce traffic congestion and travel costs by connecting commuters traveling on similar routes.

## 2. Functional Requirements
- **User Authentication**: Registration and Login for both drivers and passengers.
- **Ride Management**:
    - Drivers can offer rides with details (origin, destination, time, seats).
    - Passengers can search for rides based on Agra landmarks (e.g., Taj Mahal, Agra Fort, Dayalbagh).
    - Passengers can book seats in available rides.
- **Admin Dashboard**:
    - Manage all users and rides.
    - View system-wide statistics.
    - Hardcoded credentials: `admin` / `admin`.
- **Live Tracking**: Simulated live location updates for active rides.
- **Localization**: Focus on Agra city routes and landmarks.

## 3. Non-Functional Requirements
- **Security**: Password hashing (simulated), session management.
- **Usability**: Clean, mobile-responsive UI using Tailwind CSS.
- **Performance**: Fast response times for ride searches.

## 4. Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Express.js (Node.js).
- **Database**: SQLite (better-sqlite3).
- **Routing**: React Router.
