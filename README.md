<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/41ada37f-4f9f-42bd-900e-b98e76b348b1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Google Maps Real-Time Tracking

This app now includes real-time GPS tracking using Google Maps API.

### Setup Google Maps

1. Add your Google Maps API key to `.env`:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDmh8ZN2KQirmSOxKYZMHk9SuGbBXYts_U
```

2. The app will automatically use Google Maps for live tracking

### Features

- **Real-time location updates**: Drivers' locations update automatically
- **Auto-updating for passengers**: Location refreshes every 3 seconds
- **Route visualization**: Shows traveled and remaining route
- **Distance & duration**: Calculates real-time ETA
- **Progress tracking**: Visual progress bar along the route
- **Auto-complete**: Rides complete when within 100m of destination

### Server Configuration

The server runs on all network interfaces (`0.0.0.0`), accessible via:
- `http://localhost:3000`
- `http://10.17.6.182:3000` (your local IP)
- Any device on the same network can access using your IP

### How Location Tracking Works

- **Drivers**: Browser Geolocation API tracks position in real-time → pushes to server
- **Passengers**: Poll server every 3 seconds → display driver's current location
- **Map**: Google Maps shows route, markers, and live position updates
