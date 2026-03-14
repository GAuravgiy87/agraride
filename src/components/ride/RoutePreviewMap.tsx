/**
 * ============================================
 * ROUTE PREVIEW MAP - RIDE OFFERS (BEFORE BOOKING)
 * ============================================
 * 
 * PURPOSE:
 * - Show route direction to users BEFORE they book
 * - Help users visualize the journey path
 * - Display real road-based route (not straight lines)
 * 
 * FEATURES:
 * ✅ Real road-based routing using OSRM
 * ✅ Colored route polyline
 * ✅ Pickup and destination markers
 * ❌ NO progress bar
 * ❌ NO driver movement
 * ❌ NO ETA countdown
 * ❌ NO simulation
 * 
 * USE CASE: Ride offer screen / Search results
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Navigation } from 'lucide-react';
import { createPickupIcon3D, createDestinationIcon3D } from './MapIcons';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Agra coordinates database
const AGRA_COORDINATES: Record<string, [number, number]> = {
    'Dayalbagh': [27.2261, 78.0125],
    'St. Johns': [27.1800, 78.0100],
    'St Johns': [27.1800, 78.0100],
    'Civil Lines': [27.1800, 78.0100],
    'Taj Mahal': [27.1751, 78.0421],
    'Agra Fort': [27.1795, 78.0214],
    'Sanjay Place': [27.1983, 78.0055],
    'Sikandra': [27.2205, 77.9505],
    'ISBT Agra': [27.2155, 77.9427],
    'Bodla': [27.1900, 77.9500],
    'Shahganj': [27.1800, 77.9800],
    'Agra': [27.1767, 78.0081],
    'default': [27.1767, 78.0081]
};

const getCoordinates = (address: string): [number, number] => {
    if (!address) return AGRA_COORDINATES.default;
    const addressLower = address.toLowerCase().trim();
    const exactMatch = Object.keys(AGRA_COORDINATES).find(k => k.toLowerCase() === addressLower);
    if (exactMatch) return AGRA_COORDINATES[exactMatch];
    const partialMatch = Object.keys(AGRA_COORDINATES).find(k => 
        addressLower.includes(k.toLowerCase()) || k.toLowerCase().includes(addressLower)
    );
    if (partialMatch) return AGRA_COORDINATES[partialMatch];
    return AGRA_COORDINATES.default;
};

// Map utilities
function MapInvalidator() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100);
    }, [map]);
    return null;
}

function MapFitBounds({ bounds }: { bounds: [[number, number], [number, number]] }) {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [bounds, map]);
    return null;
}

// Using custom 3D icons from MapIcons.tsx

interface RoutePreviewMapProps {
    ride: any;
    onClose: () => void;
}

export const RoutePreviewMap = ({ ride, onClose }: RoutePreviewMapProps) => {
    const pickupCoords = getCoordinates(ride.origin);
    const destinationCoords = getCoordinates(ride.destination);

    const [routeCoords, setRouteCoords] = useState<[number, number][]>([pickupCoords, destinationCoords]);
    const [isLoading, setIsLoading] = useState(true);
    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    // Fetch route from OSRM
    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`;
        
        fetch(url, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const coords = route.geometry.coordinates.map(
                        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
                    );
                    setRouteCoords(coords);
                    setDistance(route.distance / 1000); // Convert to km
                    setDuration(Math.round(route.duration / 60)); // Convert to minutes
                }
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Route fetch error:', err);
                }
            })
            .finally(() => {
                clearTimeout(timeout);
                setIsLoading(false);
            });

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-[100] bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="absolute inset-2 sm:inset-4 md:inset-6 lg:inset-8 bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-8rem)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white z-10">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="bg-blue-100 p-2 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base sm:text-lg truncate">Route Preview</h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {ride.origin} → {ride.destination}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative bg-gray-100" style={{ minHeight: '250px' }}>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[1000]">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-medium text-gray-600">Loading route...</p>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={pickupCoords}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                            maxZoom={19}
                        />

                        <MapInvalidator />
                        <MapFitBounds bounds={[pickupCoords, destinationCoords]} />

                        {/* Route Polyline - Colored to show suggested path */}
                        <Polyline
                            positions={routeCoords}
                            color="#3b82f6"
                            weight={6}
                            opacity={0.8}
                            lineCap="round"
                            lineJoin="round"
                        />

                        {/* Pickup Marker - 3D Isometric Pin */}
                        <Marker position={pickupCoords} icon={createPickupIcon3D()}>
                            <Popup>
                                <div className="p-3">
                                    <p className="text-xs font-bold uppercase text-blue-600 mb-1">Pickup Point</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.origin}</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Destination Marker - 3D Isometric Pin */}
                        <Marker position={destinationCoords} icon={createDestinationIcon3D()}>
                            <Popup>
                                <div className="p-3">
                                    <p className="text-xs font-bold uppercase text-red-600 mb-1">Destination</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.destination}</p>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>

                    {/* Route Info Card */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 md:left-auto md:right-4 md:w-80 z-[1000]">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-5 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Route Information</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Distance</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {distance > 0 ? `${distance.toFixed(1)} km` : 'Calculating...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Est. Duration</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {duration > 0 ? `${duration} min` : 'Calculating...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Price per Seat</span>
                                    <span className="text-lg font-bold text-blue-600">₹{ride.price_per_seat}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
