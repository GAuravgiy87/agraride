import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Navigation, X, ChevronRight, TrendingUp, AlertCircle, User } from 'lucide-react';
import { User as UserType } from '../../types';
import { AGRA_COORDINATES } from './MapElements';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GENEROUTE_API_KEY = import.meta.env.VITE_GENEROUTE_API_KEY;

// Extended Agra coordinates with more locations
const EXTENDED_AGRA_COORDS: Record<string, [number, number]> = {
    ...AGRA_COORDINATES,
    'Rambagh': [27.1833, 78.0167],
    'Ram Bagh': [27.1833, 78.0167],
    'Belanganj': [27.1900, 78.0050],
    'Lohamandi': [27.1850, 78.0000],
    'Pratap Pura': [27.1950, 78.0150],
    'Nunhai': [27.2100, 78.0350],
    'Tajganj': [27.1700, 78.0450],
    'Rakabganj': [27.1750, 78.0250],
};

export const GoogleMap = ({ ride, currentUser, onClose }: { ride: any, currentUser?: UserType | null, onClose: () => void }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const carMarkerRef = useRef<google.maps.Marker | null>(null);
    const userMarkersRef = useRef<Map<number, google.maps.Marker>>(new Map());
    const routePolylineRef = useRef<google.maps.Polyline | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [currentLat, setCurrentLat] = useState<number | null>(null);
    const [currentLng, setCurrentLng] = useState<number | null>(null);
    const [allUserLocations, setAllUserLocations] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [speed, setSpeed] = useState(0);
    const [routeCoordinates, setRouteCoordinates] = useState<google.maps.LatLng[]>([]);
    const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
    const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

    // Helper function to get coordinates for a location
    const getLocationCoords = (locationName: string): [number, number] | null => {
        // Try exact match first
        if (EXTENDED_AGRA_COORDS[locationName]) {
            return EXTENDED_AGRA_COORDS[locationName];
        }
        
        // Try case-insensitive match
        const lowerName = locationName.toLowerCase();
        for (const [key, coords] of Object.entries(EXTENDED_AGRA_COORDS)) {
            if (key.toLowerCase() === lowerName) {
                return coords;
            }
        }
        
        // Try partial match
        for (const [key, coords] of Object.entries(EXTENDED_AGRA_COORDS)) {
            if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
                return coords;
            }
        }
        
        return null;
    };

    // Initialize Google Map
    useEffect(() => {
        if (!mapRef.current || googleMapRef.current) return;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.onload = initMap;
        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    const initMap = () => {
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
            zoom: 13,
            center: { lat: 27.1767, lng: 78.0081 },
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.TOP_RIGHT,
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
            },
            streetViewControl: false,
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
        });

        googleMapRef.current = map;

        // Add traffic layer toggle
        const trafficLayer = new google.maps.TrafficLayer();
        
        // Create traffic toggle button
        const trafficButton = document.createElement('button');
        trafficButton.textContent = '🚦 Traffic';
        trafficButton.className = 'bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors m-2';
        trafficButton.onclick = () => {
            if (trafficLayer.getMap()) {
                trafficLayer.setMap(null);
                trafficButton.style.backgroundColor = 'white';
                trafficButton.textContent = '🚦 Traffic';
            } else {
                trafficLayer.setMap(map);
                trafficButton.style.backgroundColor = '#FEF3C7';
                trafficButton.textContent = '🚦 Traffic ON';
            }
        };
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(trafficButton);

        // Create custom car marker with better visibility
        const carMarker = new google.maps.Marker({
            map: map,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" fill="#FF5722" stroke="white" stroke-width="2"/>
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" fill="white"/>
                        <circle cx="7" cy="17" r="2" fill="white"/>
                        <path d="M9 17h6" stroke="white"/>
                        <circle cx="17" cy="17" r="2" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
            },
            zIndex: 1000,
        });
        carMarkerRef.current = carMarker;

        // Get route from Generoute API
        getGenerouteDirections();
    };

    const getGenerouteDirections = async () => {
        if (!googleMapRef.current) return;

        try {
            let originLat: number, originLng: number;
            let destLat: number, destLng: number;

            // First priority: Use stored coordinates from database
            if (ride.origin_lat && ride.origin_lng && ride.dest_lat && ride.dest_lng) {
                originLat = ride.origin_lat;
                originLng = ride.origin_lng;
                destLat = ride.dest_lat;
                destLng = ride.dest_lng;
                setOriginCoords([originLat, originLng]);
                setDestCoords([destLat, destLng]);
                
                console.log('Using stored coordinates from database:', {
                    origin: ride.origin,
                    originCoords: [originLat, originLng],
                    destination: ride.destination,
                    destCoords: [destLat, destLng]
                });
            }
            // Second priority: Try predefined coordinates
            else {
                const originPredefined = getLocationCoords(ride.origin);
                const destPredefined = getLocationCoords(ride.destination);

                if (originPredefined && destPredefined) {
                    // Use predefined coordinates
                    [originLat, originLng] = originPredefined;
                    [destLat, destLng] = destPredefined;
                    setOriginCoords(originPredefined);
                    setDestCoords(destPredefined);
                    
                    console.log('Using predefined coordinates:', {
                        origin: ride.origin,
                        originCoords: originPredefined,
                        destination: ride.destination,
                        destCoords: destPredefined
                    });
                } else {
                    // Fallback to geocoding
                    const geocoder = new google.maps.Geocoder();
                    
                    const originResult = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
                        geocoder.geocode({ address: `${ride.origin}, Agra, Uttar Pradesh, India` }, (results, status) => {
                            if (status === 'OK' && results && results[0]) {
                                resolve(results[0]);
                            } else {
                                reject(new Error('Origin geocoding failed'));
                            }
                        });
                    });

                    const destResult = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
                        geocoder.geocode({ address: `${ride.destination}, Agra, Uttar Pradesh, India` }, (results, status) => {
                            if (status === 'OK' && results && results[0]) {
                                resolve(results[0]);
                            } else {
                                reject(new Error('Destination geocoding failed'));
                            }
                        });
                    });

                    originLat = originResult.geometry.location.lat();
                    originLng = originResult.geometry.location.lng();
                    destLat = destResult.geometry.location.lat();
                    destLng = destResult.geometry.location.lng();
                    
                    setOriginCoords([originLat, originLng]);
                    setDestCoords([destLat, destLng]);
                    
                    console.log('Using geocoded coordinates:', {
                        origin: ride.origin,
                        originCoords: [originLat, originLng],
                        destination: ride.destination,
                        destCoords: [destLat, destLng]
                    });
                }
            }

            const originLoc = new google.maps.LatLng(originLat, originLng);
            const destLoc = new google.maps.LatLng(destLat, destLng);

            // Call Generoute API for routing
            const response = await fetch('https://api.generoute.io/v1/trip', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GENEROUTE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    region: 'in',
                    locations: [
                        { lat: originLat, lon: originLng },
                        { lat: destLat, lon: destLng }
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Generoute response:', data);
                
                // Extract route coordinates
                if (data.routes && data.routes[0] && data.routes[0].geometry) {
                    const coordinates = decodePolyline(data.routes[0].geometry);
                    setRouteCoordinates(coordinates);
                    
                    // Draw route on map
                    if (routePolylineRef.current) {
                        routePolylineRef.current.setMap(null);
                    }
                    
                    const routePolyline = new google.maps.Polyline({
                        path: coordinates,
                        strokeColor: '#4285f4',
                        strokeWeight: 6,
                        strokeOpacity: 0.8,
                        map: googleMapRef.current
                    });
                    routePolylineRef.current = routePolyline;

                    // Set distance and duration
                    if (data.routes[0].distance) {
                        setDistance(`${(data.routes[0].distance / 1000).toFixed(1)} km`);
                    }
                    if (data.routes[0].duration) {
                        setDuration(`${Math.round(data.routes[0].duration / 60)} min`);
                    }

                    // Add markers
                    new google.maps.Marker({
                        position: originLoc,
                        map: googleMapRef.current,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 3,
                        },
                        title: ride.origin,
                        label: {
                            text: 'A',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }
                    });

                    new google.maps.Marker({
                        position: destLoc,
                        map: googleMapRef.current,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#ef4444',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 3,
                        },
                        title: ride.destination,
                        label: {
                            text: 'B',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }
                    });

                    // Only fit bounds initially, will be overridden by live location
                    if (currentLat === null) {
                        const bounds = new google.maps.LatLngBounds();
                        bounds.extend(originLoc);
                        bounds.extend(destLoc);
                        googleMapRef.current.fitBounds(bounds);
                    }
                }
            } else {
                console.error('Generoute API error:', await response.text());
                // Fallback to Google Directions
                fallbackToGoogleDirections(originLoc, destLoc);
            }
        } catch (error) {
            console.error('Error getting route:', error);
            // Fallback to Google Directions
            if (originCoords && destCoords) {
                const originLoc = new google.maps.LatLng(originCoords[0], originCoords[1]);
                const destLoc = new google.maps.LatLng(destCoords[0], destCoords[1]);
                fallbackToGoogleDirections(originLoc, destLoc);
            }
        }
    };

    const fallbackToGoogleDirections = (originLoc: google.maps.LatLng, destLoc: google.maps.LatLng) => {
        if (!googleMapRef.current) return;
        
        console.log('Using Google Directions fallback');
        
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
            {
                origin: originLoc,
                destination: destLoc,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    const route = result.routes[0];
                    const path = route.overview_path;
                    setRouteCoordinates(path);
                    
                    if (routePolylineRef.current) {
                        routePolylineRef.current.setMap(null);
                    }
                    
                    const routePolyline = new google.maps.Polyline({
                        path: path,
                        strokeColor: '#4285f4',
                        strokeWeight: 6,
                        strokeOpacity: 0.8,
                        map: googleMapRef.current
                    });
                    routePolylineRef.current = routePolyline;

                    const leg = route.legs[0];
                    setDistance(leg.distance?.text || '');
                    setDuration(leg.duration?.text || '');

                    // Add markers
                    new google.maps.Marker({
                        position: leg.start_location,
                        map: googleMapRef.current,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 3,
                        },
                        title: ride.origin,
                        label: {
                            text: 'A',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }
                    });

                    new google.maps.Marker({
                        position: leg.end_location,
                        map: googleMapRef.current,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#ef4444',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 3,
                        },
                        title: ride.destination,
                        label: {
                            text: 'B',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }
                    });
                }
            }
        );
    };

    // Decode polyline string to coordinates
    const decodePolyline = (encoded: string): google.maps.LatLng[] => {
        const coordinates: google.maps.LatLng[] = [];
        let index = 0;
        let lat = 0;
        let lng = 0;

        while (index < encoded.length) {
            let b;
            let shift = 0;
            let result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            coordinates.push(new google.maps.LatLng(lat / 1e5, lng / 1e5));
        }

        return coordinates;
    };

    // Real-time location tracking for current user
    useEffect(() => {
        if (isCompleted || !googleMapRef.current || !currentUser) return;

        // Watch own location and push to server
        if ("geolocation" in navigator) {
            // Get initial position first
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    updateLocation(latitude, longitude);
                    
                    // Center map on current location
                    if (googleMapRef.current) {
                        googleMapRef.current.setCenter({ lat: latitude, lng: longitude });
                        googleMapRef.current.setZoom(15);
                    }
                },
                (error) => console.error("Initial geolocation error:", error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );

            // Then start watching for updates
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed: gpsSpeed } = position.coords;
                    
                    console.log('My location update:', { latitude, longitude, speed: gpsSpeed });
                    
                    updateLocation(latitude, longitude);
                    
                    // Update speed (convert m/s to km/h)
                    if (gpsSpeed !== null && gpsSpeed > 0) {
                        setSpeed(Math.round(gpsSpeed * 3.6));
                    }

                    // Push to server with user_id
                    fetch('/api/locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ride_id: ride.id,
                            user_id: currentUser.id,
                            latitude,
                            longitude
                        })
                    }).catch(console.error);
                },
                (error) => console.error("Geolocation error:", error),
                { 
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [ride.id, currentUser, isCompleted, googleMapRef.current]);

    // Poll all users' locations from server
    useEffect(() => {
        if (!googleMapRef.current) return;

        const pollAllLocations = () => {
            fetch(`/api/locations/${ride.id}`)
                .then(res => res.json())
                .then(locations => {
                    if (Array.isArray(locations) && locations.length > 0) {
                        console.log('All users locations:', locations);
                        setAllUserLocations(locations);
                        updateAllUserMarkers(locations);
                    }
                })
                .catch(console.error);
        };
        
        // Poll immediately and then every 2 seconds
        pollAllLocations();
        pollIntervalRef.current = setInterval(pollAllLocations, 2000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [ride.id, googleMapRef.current]);

    const focusOnUser = (userId: number) => {
        if (!googleMapRef.current) return;
        
        const location = allUserLocations.find(loc => loc.user_id === userId);
        if (location) {
            const position = new google.maps.LatLng(location.latitude, location.longitude);
            googleMapRef.current.panTo(position);
            googleMapRef.current.setZoom(17);
            
            // Open info window for this marker
            const marker = userMarkersRef.current.get(userId);
            if (marker) {
                const infoWindow = (marker as any).infoWindow;
                if (infoWindow) {
                    // Close all other info windows
                    userMarkersRef.current.forEach((m, id) => {
                        if (id !== userId) {
                            const existingInfo = (m as any).infoWindow;
                            if (existingInfo) existingInfo.close();
                        }
                    });
                    infoWindow.open(googleMapRef.current, marker);
                }
                // Bounce the marker
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => marker.setAnimation(null), 2100);
            }
        }
    };

    const focusOnRoute = () => {
        if (!googleMapRef.current || !originCoords || !destCoords) return;
        
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(originCoords[0], originCoords[1]));
        bounds.extend(new google.maps.LatLng(destCoords[0], destCoords[1]));
        
        // Include all user locations in bounds
        allUserLocations.forEach(loc => {
            bounds.extend(new google.maps.LatLng(loc.latitude, loc.longitude));
        });
        
        googleMapRef.current.fitBounds(bounds);
    };

    const updateAllUserMarkers = (locations: any[]) => {
        if (!googleMapRef.current) return;

        locations.forEach(loc => {
            const userId = loc.user_id;
            const isDriver = userId === ride.driver_id;
            const isMe = currentUser && userId === currentUser.id;
            
            let marker = userMarkersRef.current.get(userId);
            
            if (!marker) {
                // Create new marker for this user with distinct colors
                let markerColor, markerIcon, markerLabel, markerScale;
                
                if (isDriver) {
                    // Driver: Large Orange Car
                    markerColor = '#FF5722';
                    markerIcon = '🚗';
                    markerLabel = 'DRIVER';
                    markerScale = 15;
                } else if (isMe) {
                    // Me: Large Green Pin
                    markerColor = '#4CAF50';
                    markerIcon = '📍';
                    markerLabel = 'YOU';
                    markerScale = 14;
                } else {
                    // Other Passengers: Blue Person
                    markerColor = '#2196F3';
                    markerIcon = '👤';
                    markerLabel = 'PASS';
                    markerScale = 12;
                }
                
                marker = new google.maps.Marker({
                    map: googleMapRef.current,
                    position: { lat: loc.latitude, lng: loc.longitude },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: markerScale,
                        fillColor: markerColor,
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 4,
                    },
                    label: {
                        text: markerIcon,
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    },
                    title: loc.user_name,
                    zIndex: isMe ? 1002 : isDriver ? 1001 : 1000,
                    animation: google.maps.Animation.DROP,
                });

                // Add info window with role-specific styling
                const roleText = isDriver ? '🚗 DRIVER' : isMe ? '📍 YOU' : '👤 PASSENGER';
                const roleColor = isDriver ? '#FF5722' : isMe ? '#4CAF50' : '#2196F3';
                
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 12px; min-width: 180px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${roleColor};"></div>
                                <p style="font-weight: bold; margin: 0; font-size: 14px;">${loc.user_name}</p>
                            </div>
                            <p style="font-size: 12px; color: ${roleColor}; font-weight: bold; margin: 0 0 8px 0;">
                                ${roleText}
                            </p>
                            <p style="font-size: 10px; color: #999; margin: 0; font-family: monospace;">
                                ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}
                            </p>
                            <p style="font-size: 9px; color: #ccc; margin: 4px 0 0 0;">
                                Updated: ${new Date(loc.updated_at).toLocaleTimeString()}
                            </p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    // Close all other info windows
                    userMarkersRef.current.forEach((m, id) => {
                        if (id !== userId) {
                            const existingInfo = (m as any).infoWindow;
                            if (existingInfo) existingInfo.close();
                        }
                    });
                    infoWindow.open(googleMapRef.current, marker);
                });

                // Store info window reference
                (marker as any).infoWindow = infoWindow;

                userMarkersRef.current.set(userId, marker);
            } else {
                // Update existing marker position with smooth animation
                const newPosition = new google.maps.LatLng(loc.latitude, loc.longitude);
                const oldPosition = marker.getPosition();
                
                if (oldPosition && !oldPosition.equals(newPosition)) {
                    marker.setPosition(newPosition);
                    // Add bounce animation for movement
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(() => marker.setAnimation(null), 700);
                }
            }

            // Update own location state
            if (isMe) {
                setCurrentLat(loc.latitude);
                setCurrentLng(loc.longitude);
            }
        });
    };

    const updateLocation = (lat: number, lng: number) => {
        console.log('Updating location to:', { lat, lng });
        
        setCurrentLat(lat);
        setCurrentLng(lng);

        if (carMarkerRef.current && googleMapRef.current) {
            const position = new google.maps.LatLng(lat, lng);
            
            // Smoothly animate marker to new position
            carMarkerRef.current.setPosition(position);
            
            // Only pan map if marker is not visible
            const bounds = googleMapRef.current.getBounds();
            if (bounds && !bounds.contains(position)) {
                googleMapRef.current.panTo(position);
            }

            // Calculate progress using route coordinates
            if (routeCoordinates.length > 0) {
                const totalDistance = google.maps.geometry.spherical.computeLength(routeCoordinates);
                
                // Find closest point on route
                let minDist = Infinity;
                let closestIndex = 0;
                routeCoordinates.forEach((point, index) => {
                    const dist = google.maps.geometry.spherical.computeDistanceBetween(
                        position,
                        point
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        closestIndex = index;
                    }
                });

                const traveledPath = routeCoordinates.slice(0, closestIndex + 1);
                const traveledDistance = google.maps.geometry.spherical.computeLength(traveledPath);
                const progressPercent = Math.min(1, traveledDistance / totalDistance);
                setProgress(progressPercent);

                // Check if near destination (within 100m)
                const destination = routeCoordinates[routeCoordinates.length - 1];
                const distToDestination = google.maps.geometry.spherical.computeDistanceBetween(
                    position,
                    destination
                );
                
                console.log('Distance to destination:', distToDestination, 'meters');
                
                if (distToDestination < 100) {
                    setIsCompleted(true);
                }
            }
        }
    };

    const handleEndRide = async () => {
        const res = await fetch(`/api/rides/complete/${ride.id}`, { method: 'POST' });
        if (res.ok) {
            alert("Ride completed successfully!");
            onClose();
        }
    };

    const triggerSOS = async () => {
        if (!currentUser) return;
        const res = await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ride_id: ride.id, user_id: currentUser.id })
        });
        if (res.ok) {
            alert("SOS Alert Sent! Admin has been notified.");
        }
    };

    const recenterMap = () => {
        if (googleMapRef.current && currentLat && currentLng) {
            googleMapRef.current.panTo({ lat: currentLat, lng: currentLng });
            googleMapRef.current.setZoom(15);
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <Navigation className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                Live Tracking: {ride.driver_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-bold text-slate-700">{ride.origin}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="font-bold text-slate-700">{ride.destination}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="h-[600px] relative">
                    <div ref={mapRef} className="w-full h-full" />

                    <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-4">
                        {currentLat && currentLng && (
                            <div className="bg-white/90 backdrop-blur p-4 rounded-3xl border border-white shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Live Tracking</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium">
                                    {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                                </p>
                            </div>
                        )}
                        
                        {allUserLocations.length > 0 && (
                            <div className="bg-white/90 backdrop-blur p-4 rounded-3xl border border-white shadow-xl max-w-xs">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                                        Participants ({allUserLocations.length})
                                    </p>
                                    <button
                                        onClick={focusOnRoute}
                                        className="text-[9px] text-primary font-bold uppercase tracking-wider hover:underline"
                                        title="View All"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {allUserLocations.map(loc => {
                                        const isDriver = loc.user_id === ride.driver_id;
                                        const isMe = currentUser && loc.user_id === currentUser.id;
                                        return (
                                            <button
                                                key={loc.user_id}
                                                onClick={() => focusOnUser(loc.user_id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105 ${
                                                    isDriver ? 'bg-orange-50 hover:bg-orange-100' : isMe ? 'bg-green-50 hover:bg-green-100' : 'bg-blue-50 hover:bg-blue-100'
                                                }`}
                                            >
                                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                                    isDriver ? 'bg-orange-500 animate-pulse' : isMe ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                                                }`} />
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="text-xs font-bold text-slate-800 truncate">
                                                        {loc.user_name}
                                                    </p>
                                                    <p className={`text-[9px] font-bold uppercase tracking-wider ${
                                                        isDriver ? 'text-orange-600' : isMe ? 'text-green-600' : 'text-blue-600'
                                                    }`}>
                                                        {isDriver ? '🚗 Driver' : isMe ? '📍 You' : '👤 Passenger'}
                                                    </p>
                                                </div>
                                                <Navigation className={`w-4 h-4 flex-shrink-0 ${
                                                    isDriver ? 'text-orange-500' : isMe ? 'text-green-500' : 'text-blue-500'
                                                }`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-white/90 backdrop-blur p-4 rounded-3xl border border-white shadow-xl flex items-center gap-4">
                            <div className="bg-emerald-50 p-2 rounded-xl">
                                <TrendingUp className="text-emerald-600 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Current Speed</p>
                                <p className="text-sm font-bold text-slate-800">{speed || 0} km/h</p>
                            </div>
                        </div>

                        <button
                            onClick={recenterMap}
                            className="bg-white text-slate-800 p-4 rounded-3xl shadow-xl flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-100"
                            title="Recenter"
                        >
                            <Navigation className="w-5 h-5 text-primary" />
                        </button>

                        <button
                            onClick={triggerSOS}
                            className="bg-red-600 text-white p-4 rounded-3xl shadow-xl flex items-center gap-3 hover:bg-red-700 transition-all animate-pulse"
                        >
                            <AlertCircle className="w-6 h-6" />
                            <span className="font-black uppercase tracking-widest text-xs">SOS Emergency</span>
                        </button>
                    </div>

                    <div className="absolute bottom-8 right-8 z-[1000] bg-slate-900 text-white p-6 rounded-[3rem] shadow-2xl w-80 border border-slate-800 backdrop-blur-md bg-opacity-95">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Tracking</span>
                            </div>
                            <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {duration || 'Calculating...'}
                                </span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mb-6 p-4 bg-slate-800 rounded-2xl border border-slate-700">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-3">Map Legend</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[8px]">🚗</div>
                                    <span className="text-[10px] text-slate-300">Driver (Orange)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px]">📍</div>
                                    <span className="text-[10px] text-slate-300">You (Green)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">👤</div>
                                    <span className="text-[10px] text-slate-300">Passengers (Blue)</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative pl-6 border-l-2 border-dashed border-slate-700 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900" />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pickup</p>
                                    <p className="text-sm font-bold text-white truncate">{ride.origin}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-slate-900" />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Destination</p>
                                    <p className="text-sm font-bold text-white truncate">{ride.destination}</p>
                                </div>
                            </div>

                            {distance && (
                                <div className="pt-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Distance</p>
                                    <p className="text-sm font-bold text-white">{distance}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Progress</span>
                                    <span className="text-[10px] text-primary font-bold uppercase">{Math.round(progress * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress * 100}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Driver</p>
                                        <p className="text-sm font-bold text-white">{ride.driver_name}</p>
                                    </div>
                                </div>
                                {currentUser?.id === ride.driver_id && (
                                    <button
                                        onClick={handleEndRide}
                                        className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-orange-600 transition-colors"
                                    >
                                        End Ride
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
