# AgraRide — Smart Carpooling Platform

A full-stack carpooling web app for Agra city with real-time GPS tracking, in-app messaging, smart booking, and an admin dashboard.

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS 4 (orange theme)
- Framer Motion
- Leaflet + Leaflet Routing Machine (OSRM)
- React Router v7
- Lucide React icons

**Backend**
- Node.js + Express.js (TypeScript)
- Prisma ORM
- PostgreSQL

**Infrastructure**
- Vite (dev server + bundler)
- tsx (TypeScript runner)
- dotenv

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud — [Neon](https://neon.tech) / [Supabase](https://supabase.com) work great)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set your DATABASE_URL and any API keys

# 3. Push schema to your database
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Start the dev server
npm run dev
```

App runs at `http://localhost:3000`

### Default Admin Account
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@agraride.com     |
| Password | admin                  |

> Change this password immediately in production.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@host:5432/agraride"
NODE_ENV="development"
PORT=3000
VITE_GOOGLE_MAPS_API_KEY="..."
GEMINI_API_KEY="..."
APP_URL="http://localhost:3000"
```

---

## Scripts

```bash
npm run dev       # Start dev server (Express + Vite)
npm run build     # Build frontend for production
npm run preview   # Preview production build
npm run lint      # TypeScript type check
npm run clean     # Remove dist/
```

```bash
npx prisma db push      # Sync schema to database
npx prisma generate     # Regenerate Prisma client
npx prisma studio       # Open Prisma visual DB browser
```

---

## Project Structure

```
agraride/
├── prisma/
│   └── schema.prisma       # Database schema (PostgreSQL)
├── prisma.config.ts        # Prisma v7 config (adapter + datasource)
├── server.ts               # Express backend (all API routes)
├── src/
│   ├── pages/              # Route-level React components
│   ├── components/         # Shared UI components
│   │   ├── admin/
│   │   ├── booking/
│   │   ├── common/
│   │   ├── profile/
│   │   └── ride/
│   ├── services/
│   │   └── ApiService.ts   # HTTP client (singleton)
│   ├── repositories/
│   │   └── index.ts        # Data access layer
│   ├── hooks/
│   │   └── useApi.ts       # React hooks for API state
│   ├── contexts/           # React context providers
│   ├── utils/              # Helpers (geocoding, CO2 calc)
│   └── types.ts            # Shared TypeScript types
├── .env.example            # Environment variable template
└── vite.config.ts
```

---

## Database Schema

Managed by Prisma. 7 models:

| Model      | Description                          |
|------------|--------------------------------------|
| User       | Accounts (drivers, passengers, admin)|
| Ride       | Ride offerings with GPS coordinates  |
| Booking    | Booking requests and confirmations   |
| Location   | Real-time GPS tracking data          |
| Message    | In-app chat between users            |
| Rating     | 5-star reviews after rides           |
| SosAlert   | Emergency alerts                     |

---

## API Endpoints

| Method | Path                              | Description                  |
|--------|-----------------------------------|------------------------------|
| POST   | /api/register                     | Register new user            |
| POST   | /api/login                        | Login                        |
| GET    | /api/users/:id                    | Get user profile             |
| PUT    | /api/users/:id                    | Update user profile          |
| GET    | /api/rides                        | List active rides            |
| POST   | /api/rides                        | Create ride                  |
| PUT    | /api/rides/:id                    | Update ride                  |
| DELETE | /api/rides/:id                    | Delete ride                  |
| POST   | /api/rides/complete/:id           | Mark ride complete           |
| POST   | /api/bookings                     | Create booking               |
| POST   | /api/bookings/accept/:id          | Accept booking               |
| POST   | /api/bookings/reject/:id          | Reject booking               |
| GET    | /api/bookings/driver/:id          | Driver's pending bookings    |
| GET    | /api/bookings/passenger/:id       | Passenger's bookings         |
| GET    | /api/messages/:rideId             | Get ride messages            |
| POST   | /api/messages                     | Send message                 |
| GET    | /api/inbox/:userId                | Get user inbox               |
| POST   | /api/ratings                      | Submit rating                |
| GET    | /api/ratings/:userId              | Get user ratings             |
| POST   | /api/sos                          | Trigger SOS alert            |
| POST   | /api/sos/resolve/:id              | Resolve SOS alert            |
| GET    | /api/admin/stats                  | Admin dashboard stats        |
| GET    | /api/admin/users                  | List all users               |
| DELETE | /api/admin/users/:id              | Delete user                  |
| PUT    | /api/admin/users/:id/role         | Update user role             |
| GET    | /api/admin/rides                  | List all rides               |
| GET    | /api/admin/db/tables              | List DB tables               |
| GET    | /api/admin/db/table/:name         | View table rows              |
| POST   | /api/admin/db/query               | Run raw SQL query            |

---

## Features

**Riders**
- Search rides by route
- Book with optional counter-offer pricing
- Real-time GPS tracking during ride
- In-app chat with driver
- Rate driver after completion

**Drivers**
- Offer rides with route, seats, and price
- Accept or reject booking requests
- Share live location during ride
- Rate passengers

**Admin**
- System stats dashboard
- User and ride management
- SOS emergency alert handling
- Raw database access via Prisma Studio or admin panel

---

## Security Notes

Current implementation is for development/educational use:
- Passwords stored as plain text — add bcrypt before going live
- Sessions via localStorage — add JWT or server sessions for production
- No rate limiting — add express-rate-limit
- Admin endpoints are unprotected — add auth middleware

---

## License

Proprietary — educational use only.
