import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, X, ChevronRight, TrendingUp, AlertCircle, User } from 'lucide-react';
import { User as UserType } from '../../types';
import { AGRA_COORDINATES, MapUpdater, RecenterButton } from './MapElements';

export const SimulatedMap = ({ ride, currentUser, onClose }: { ride: any, currentUser?: UserType | null, onClose: () => void }) => {
    const getCoords = (name: string): [number, number] => {
        const key = Object.keys(AGRA_COORDINATES).find(k => name.toLowerCase().includes(k.toLowerCase()));
        return key ? AGRA_COORDINATES[key] : [27.1767, 78.0081];
    };

    const startCoords = getCoords(ride.origin);
    const endCoords = getCoords(ride.destination);

    const [currentLat, setCurrentLat] = useState(startCoords[0]);
    const [currentLng, setCurrentLng] = useState(startCoords[1]);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Helper to calculate progress based on current position
    const calculateProgress = (lat: number, lng: number) => {
        const totalDist = Math.sqrt(Math.pow(endCoords[0] - startCoords[0], 2) + Math.pow(endCoords[1] - startCoords[1], 2));
        const currentDist = Math.sqrt(Math.pow(lat - startCoords[0], 2) + Math.pow(lng - startCoords[1], 2));
        return Math.min(1, currentDist / totalDist);
    };

    useEffect(() => {
        if (isCompleted) return;

        let watchId: number;
        let pollInterval: NodeJS.Timeout;

        if (currentUser?.id === ride.driver_id) {
            // Driver: Watch real location and push to server
            if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLat(latitude);
                        setCurrentLng(longitude);
                        setProgress(calculateProgress(latitude, longitude));

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

                        // Auto-complete if very close to destination
                        const distToTarget = Math.sqrt(Math.pow(latitude - endCoords[0], 2) + Math.pow(longitude - endCoords[1], 2));
                        if (distToTarget < 0.001) { // roughly 100m
                            setIsCompleted(true);
                        }
                    },
                    (error) => console.error("Geolocation error:", error),
                    { enableHighAccuracy: true }
                );
            }
        } else {
            // Passenger: Poll location from server
            pollInterval = setInterval(() => {
                fetch(`/api/locations/${ride.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data) {
                            setCurrentLat(data.latitude);
                            setCurrentLng(data.longitude);
                            setProgress(calculateProgress(data.latitude, data.longitude));

                            const distToTarget = Math.sqrt(Math.pow(data.latitude - endCoords[0], 2) + Math.pow(data.longitude - endCoords[1], 2));
                            if (distToTarget < 0.001) {
                                setIsCompleted(true);
                            }
                        }
                    })
                    .catch(console.error);
            }, 5000);
        }

        return () => {
            document.body.style.overflow = 'auto';
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [ride.id, currentUser?.id, ride.driver_id, isCompleted]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

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

    const carIcon = L.divIcon({
        html: `<div class="bg-primary p-2 rounded-xl shadow-xl border-2 border-white text-white marker-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    const pinIcon = (color: string) => L.divIcon({
        html: `<div class="${color} p-1.5 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

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
                    <MapContainer
                        center={startCoords}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                        scrollWheelZoom={true}
                        dragging={true}
                        touchZoom={true}
                        doubleClickZoom={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapUpdater center={[currentLat, currentLng]} />
                        <RecenterButton center={[currentLat, currentLng]} />

                        {/* Traveled Route - Google Maps Style Highlight */}
                        <Polyline
                            positions={[startCoords, [currentLat, currentLng]]}
                            color="#ffffff"
                            weight={10}
                            opacity={0.9}
                        />
                        <Polyline
                            positions={[startCoords, [currentLat, currentLng]]}
                            color="#4285f4"
                            weight={6}
                            opacity={1}
                            lineCap="round"
                            lineJoin="round"
                        />

                        {/* Remaining Route - Dashed Highlight */}
                        <Polyline
                            positions={[[currentLat, currentLng], endCoords]}
                            color="#ffffff"
                            weight={10}
                            opacity={0.5}
                        />
                        <Polyline
                            positions={[[currentLat, currentLng], endCoords]}
                            color="#4285f4"
                            weight={6}
                            dashArray="1, 15"
                            opacity={0.5}
                            lineCap="round"
                        />

                        <Marker position={startCoords} icon={pinIcon('bg-emerald-500 text-white')}>
                            <Popup>
                                <div className="p-2">
                                    <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Pickup Point</p>
                                    <p className="text-sm font-bold text-slate-800">{ride.origin}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Marker position={endCoords} icon={pinIcon('bg-red-500 text-white')}>
                            <Popup>
                                <div className="p-2">
                                    <p className="text-[10px] font-black uppercase text-red-600 mb-1">Destination</p>
                                    <p className="text-sm font-bold text-slate-800">{ride.destination}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Marker position={[currentLat, currentLng]} icon={carIcon}>
                            <Popup>
                                <div className="p-2">
                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Current Location</p>
                                    <p className="text-sm font-bold text-slate-800">{ride.driver_name}'s Vehicle</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Speed: 42 km/h • Heading North</p>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>

                    <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-4">
                        <div className="bg-white/90 backdrop-blur p-4 rounded-3xl border border-white shadow-xl flex items-center gap-4">
                            <div className="bg-emerald-50 p-2 rounded-xl">
                                <TrendingUp className="text-emerald-600 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Current Speed</p>
                                <p className="text-sm font-bold text-slate-800">42 km/h</p>
                            </div>
                        </div>

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
                                <span className="text-[10px] font-bold text-slate-400 uppercase">ETA: {Math.round((1 - progress) * 15)}m</span>
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
