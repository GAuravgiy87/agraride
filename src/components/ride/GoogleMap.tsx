import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Navigation, X, ChevronRight, TrendingUp, AlertCircle, User } from 'lucide-react';
import { User as UserType } from '../../types';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const GoogleMap = ({ ride, currentUser, onClose }: { ride: any, currentUser?: UserType | null, onClose: () => void }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const carMarkerRef = useRef<google.maps.Marker | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [currentLat, setCurrentLat] = useState<number | null>(null);
    const [currentLng, setCurrentLng] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [speed, setSpeed] = useState(0);

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
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        googleMapRef.current = map;

        // Initialize directions renderer
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#4285f4',
                strokeWeight: 6,
                strokeOpacity: 0.8,
            }
        });
        directionsRendererRef.current = directionsRenderer;

        // Create custom car marker
        const carMarker = new google.maps.Marker({
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF5722',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
            },
        });
        carMarkerRef.current = carMarker;

        // Get directions
        getDirections();
    };

    const getDirections = () => {
        if (!googleMapRef.current) return;

        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
            {
                origin: ride.origin,
                destination: ride.destination,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === 'OK' && result && directionsRendererRef.current) {
                    directionsRendererRef.current.setDirections(result);
                    
                    // Add custom markers
                    const leg = result.routes[0].legs[0];
                    setDistance(leg.distance?.text || '');
                    setDuration(leg.duration?.text || '');

                    // Start marker
                    new google.maps.Marker({
                        position: leg.start_location,
                        map: googleMapRef.current,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                        },
                        title: ride.origin,
                    });

                    // End marker
                    new google.maps.Marker({
                        position: leg.end_location,
                        map: googleMapRef.current,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#ef4444',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                        },
                        title: ride.destination,
                    });
                }
            }
        );
    };

    // Real-time location tracking
    useEffect(() => {
        if (isCompleted || !googleMapRef.current) return;

        if (currentUser?.id === ride.driver_id) {
            // Driver: Watch real location and push to server
            if ("geolocation" in navigator) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude, speed: gpsSpeed } = position.coords;
                        updateLocation(latitude, longitude);
                        
                        // Update speed (convert m/s to km/h)
                        if (gpsSpeed !== null) {
                            setSpeed(Math.round(gpsSpeed * 3.6));
                        }

                        // Push to server
                        fetch('/api/locations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ride_id: ride.id,
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
            }
        } else {
            // Passenger: Poll location from server every 3 seconds
            pollIntervalRef.current = setInterval(() => {
                fetch(`/api/locations/${ride.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data) {
                            updateLocation(data.latitude, data.longitude);
                        }
                    })
                    .catch(console.error);
            }, 3000);
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [ride.id, currentUser?.id, ride.driver_id, isCompleted]);

    const updateLocation = (lat: number, lng: number) => {
        setCurrentLat(lat);
        setCurrentLng(lng);

        if (carMarkerRef.current && googleMapRef.current) {
            const position = { lat, lng };
            carMarkerRef.current.setPosition(position);
            googleMapRef.current.panTo(position);

            // Calculate progress using Google Maps Geometry library
            if (directionsRendererRef.current) {
                const directions = directionsRendererRef.current.getDirections();
                if (directions) {
                    const route = directions.routes[0];
                    const path = route.overview_path;
                    const totalDistance = google.maps.geometry.spherical.computeLength(path);
                    
                    // Find closest point on route
                    let minDist = Infinity;
                    let closestIndex = 0;
                    path.forEach((point, index) => {
                        const dist = google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(lat, lng),
                            point
                        );
                        if (dist < minDist) {
                            minDist = dist;
                            closestIndex = index;
                        }
                    });

                    const traveledPath = path.slice(0, closestIndex + 1);
                    const traveledDistance = google.maps.geometry.spherical.computeLength(traveledPath);
                    const progressPercent = Math.min(1, traveledDistance / totalDistance);
                    setProgress(progressPercent);

                    // Check if near destination (within 100m)
                    const destination = path[path.length - 1];
                    const distToDestination = google.maps.geometry.spherical.computeDistanceBetween(
                        new google.maps.LatLng(lat, lng),
                        destination
                    );
                    if (distToDestination < 100) {
                        setIsCompleted(true);
                    }
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
                        <div className="bg-white/90 backdrop-blur p-4 rounded-3xl border border-white shadow-xl flex items-center gap-4">
                            <div className="bg-emerald-50 p-2 rounded-xl">
                                <TrendingUp className="text-emerald-600 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Current Speed</p>
                                <p className="text-sm font-bold text-slate-800">{speed} km/h</p>
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
