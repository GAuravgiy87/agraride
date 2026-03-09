<div align="center">

# 🚗 AgraRide

### *Smart Carpooling for a Sustainable Agra*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

*A modern, feature-rich carpooling platform designed specifically for Agra city, enabling commuters to share rides, reduce costs, and contribute to a greener environment.*

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots)

</div>

---

## 🌟 Overview

**AgraRide** is a comprehensive carpooling web application that connects drivers and passengers traveling on similar routes within Agra, India. Built with modern web technologies, it offers real-time GPS tracking, in-app messaging, dynamic pricing with counter-offers, and a robust admin dashboard for system monitoring.

### 🎯 Mission
To reduce traffic congestion, lower commuting costs, and promote sustainable transportation in Agra by making carpooling safe, convenient, and accessible to everyone.

### 💡 Why AgraRide?
- **Cost Savings**: Save up to 60% on daily commute expenses
- **Eco-Friendly**: Reduce carbon emissions and traffic congestion
- **Safety First**: Verified users, live tracking, and SOS emergency alerts
- **Community Building**: Connect with like-minded commuters
- **Flexible Pricing**: Counter-offer system for fair pricing

---

## ✨ Features

### 🔐 User Authentication & Profiles
- Secure registration and login system
- User profiles with ratings and statistics
- Role-based access control (User/Admin)
- Gender and vehicle type preferences

### 🚙 Ride Management
- **Offer Rides**: Drivers can create ride offerings with:
  - Interactive map-based location selection
  - GPS coordinate storage for accurate tracking
  - Vehicle type selection (2-wheeler/4-wheeler)
  - Flexible seat availability (1-6 seats)
  - Custom pricing per seat
  - Departure time scheduling

- **Search & Book Rides**: Passengers can:
  - Browse all available rides
  - Filter by location and landmarks
  - View driver ratings and vehicle details
  - Preview routes on interactive maps
  - Make counter-offers on pricing
  - Track booking status in real-time

### 💰 Smart Booking System
- **Counter-Offer Mechanism**: Passengers can negotiate prices
- **Instant Notifications**: Real-time booking request updates
- **Seat Management**: Automatic seat availability tracking
- **Booking History**: Complete record of past and upcoming rides
- **Status Tracking**: Pending, Confirmed, Rejected, Cancelled states

### 📍 Real-Time GPS Tracking
- **Live Location Updates**: Driver positions update every 3 seconds
- **Route Visualization**: Interactive maps showing origin, destination, and current location
- **Progress Tracking**: Visual indicators of trip progress
- **ETA Calculation**: Real-time estimated time of arrival
- **Multi-User Tracking**: Track all participants in a ride
- **Auto-Completion**: Rides automatically complete when reaching destination

### 💬 In-App Messaging
- Direct chat between drivers and passengers
- Ride-specific conversation threads
- Message history and inbox management
- Quick communication for ride coordination

### ⭐ Rating & Review System
- 5-star rating scale for drivers and passengers
- Written reviews and comments
- Average rating display on profiles
- Rating history for transparency
- Post-ride rating prompts

### 🚨 SOS Emergency System
- One-click emergency alert button
- Instant notification to admin dashboard
- Ride details and participant information
- Live tracking link for authorities
- Alert resolution tracking

### 🛡️ Admin Dashboard
- **System Overview**: Real-time statistics and metrics
- **User Management**: View, delete, and modify user roles
- **Ride Monitoring**: Track all rides and their status
- **Security Center**: Active SOS alert monitoring
- **Database Management**: Direct database access and query execution
- **Analytics**: Passenger-driver pairing insights

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agraride
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
   
   *Note: The app works with OpenStreetMap by default. Google Maps API key is optional.*

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Local: `http://localhost:3000`
   - Network: `http://<your-ip>:3000`

### Default Admin Access
- **Email**: `admin@agraride.com`
- **Password**: `admin`

---

## 📖 Documentation

Comprehensive documentation is available in the following files:

- **[system.md](./system.md)** - Complete system architecture, features, API documentation, and technical details
- **[roles.md](./roles.md)** - Role-based team documentation for 4-person development team
- **[SRS.md](./SRS.md)** - Software Requirements Specification

### Key Documentation Sections
- System architecture and design patterns
- Database schema and relationships
- API endpoint specifications with examples
- Frontend component structure
- User flows and use cases
- Security considerations
- Testing guidelines

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router v7** - Client-side routing
- **Leaflet** - Interactive maps
- **Lucide React** - Beautiful icons
- **date-fns** - Date formatting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **better-sqlite3** - Fast SQLite database

### Development Tools
- **Vite** - Lightning-fast build tool
- **tsx** - TypeScript execution
- **ESLint** - Code linting

### External APIs
- **OpenStreetMap** - Map tiles and visualization
- **Nominatim** - Geocoding and reverse geocoding
- **Browser Geolocation API** - GPS tracking

---

## 🗄️ Database Schema

The application uses SQLite with 7 core tables:

```
users ──┬─→ rides ──┬─→ bookings
        │           ├─→ locations
        │           ├─→ messages
        │           ├─→ ratings
        │           └─→ sos_alerts
        │
        └─→ (relationships via foreign keys)
```

### Tables
- **users**: User accounts and profiles
- **rides**: Ride offerings with GPS coordinates
- **bookings**: Booking requests and confirmations
- **locations**: Real-time GPS tracking data
- **messages**: In-app chat messages
- **ratings**: User reviews and ratings
- **sos_alerts**: Emergency alerts

---

## 📱 Screenshots

### Home Page
Beautiful landing page with hero section and feature highlights.

### Search Rides
Browse available rides with driver details, ratings, and route previews.

### Live Tracking
Real-time GPS tracking with interactive maps showing driver location and route progress.

### Admin Dashboard
Comprehensive system monitoring with statistics, user management, and SOS alerts.

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run TypeScript type checking
npm run clean        # Clean build artifacts
```

---

## 🌐 Network Access

The server runs on all network interfaces (`0.0.0.0`), making it accessible from:
- **Localhost**: `http://localhost:3000`
- **Local Network**: `http://<your-ip>:3000`
- **Mobile Devices**: Connect to the same WiFi and use your computer's IP

This enables testing on mobile devices and sharing with team members on the same network.

---

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **SQL Injection Prevention**: Parameterized queries throughout
- **Role-Based Access**: Admin-only endpoints protected
- **Session Management**: Secure user sessions
- **SOS Emergency System**: Quick access to help

### ⚠️ Production Considerations
For production deployment, implement:
- Password hashing (bcrypt/argon2)
- JWT authentication
- HTTPS/SSL encryption
- Rate limiting
- CORS configuration
- Environment variable protection

---

## 🎨 Design Philosophy

AgraRide follows modern design principles:
- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: WCAG-compliant components
- **Performance**: Optimized loading and rendering
- **User Experience**: Intuitive navigation and clear feedback
- **Visual Hierarchy**: Clear information architecture
- **Consistency**: Unified design language throughout

---

## 🚦 How It Works

### For Drivers
1. Register and create profile
2. Offer a ride with route details
3. Receive booking requests
4. Accept/reject bookings
5. Start ride and share live location
6. Complete ride and receive ratings

### For Passengers
1. Register and create profile
2. Search for available rides
3. View driver details and route
4. Book ride (with optional counter-offer)
5. Track ride in real-time
6. Rate driver after completion

### Real-Time Tracking Flow
```
Driver's Browser (Geolocation API)
        ↓
    GPS Coordinates
        ↓
POST /api/locations (every few seconds)
        ↓
    SQLite Database
        ↓
GET /api/locations/:rideId (polling every 3s)
        ↓
Passenger's Browser (Map Display)
```

---

## 🤝 Contributing

This is a team project. For contribution guidelines:
1. Review the [roles.md](./roles.md) for role-specific responsibilities
2. Follow the coding standards in [system.md](./system.md)
3. Test your changes thoroughly
4. Document new features

---

## 📊 Project Statistics

- **Total Files**: 50+
- **Lines of Code**: 5000+
- **API Endpoints**: 40+
- **Database Tables**: 7
- **React Components**: 25+
- **Pages**: 8

---

## 🔮 Future Enhancements

- [ ] Payment gateway integration (UPI, Paytm, Razorpay)
- [ ] Push notifications for real-time alerts
- [ ] Mobile app (React Native)
- [ ] AI-based ride matching
- [ ] Recurring ride scheduling
- [ ] Group booking system
- [ ] Carbon footprint tracking
- [ ] Referral and rewards program
- [ ] Multi-language support (Hindi, English)
- [ ] Advanced analytics dashboard

---

## 📄 License

This project is proprietary software developed for educational purposes.

---

## 👥 Team

This project is designed for a 4-person development team:
- **Frontend UI/UX Developer** - Authentication, Home, Profile
- **Backend API Developer** - RESTful APIs, Business Logic
- **Database & Admin Developer** - Schema, Admin Dashboard
- **Maps & Real-Time Developer** - GPS Tracking, Location Features

See [roles.md](./roles.md) for detailed role descriptions.

---

## 📞 Support

For issues, questions, or contributions:
- Review the documentation files
- Check the SRS for requirements
- Contact the development team

---

## 🙏 Acknowledgments

- **OpenStreetMap** - Free map data
- **Nominatim** - Geocoding services
- **Lucide** - Beautiful icon library
- **Tailwind CSS** - Utility-first CSS framework
- **React Community** - Amazing ecosystem

---

<div align="center">

**Built with ❤️ for Agra**

*Making carpooling safe, affordable, and sustainable*

[⬆ Back to Top](#-agraride)

</div>
