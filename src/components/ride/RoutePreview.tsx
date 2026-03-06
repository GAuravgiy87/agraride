import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Navigation, Clock, MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GENEROUTE_API_KEY = import.meta.env.VITE_GENEROUTE_API_KEY;

interface RoutePreviewProps {
    ride: any;
    onClose: () => void;
}

export const RoutePreview = ({ ride, onClose }: RoutePreviewProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(true);

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
        });

        googleMapRef.current = map;

        // Add traffic layer toggle
        const trafficLayer = new google.maps.TrafficLayer();
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

        drawRoute();
    };

    const drawRoute = async () => {
        if (!googleMapRef.current) return;

        try {
            let originLat: number, originLng: number;
            let destLat: number, destLng: number;

            // Use stored coordinates if available
            if (ride.origin_lat && ride.origin_lng && ride.dest_lat && ride.dest_lng) {
                originLat = ride.origin_lat;
                originLng = ride.origin_lng;
                destLat = ride.dest_lat;
                destLng = ride.dest_lng;
            } else {
                // Fallback to geocoding
                const geocoder = new google.maps.Geocoder();
                
                const originResult = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
                    geocoder.geocode({ address: `${ride.origin}, Agra, India` }, (results, status) => {
                        if (status === 'OK' && results && results[0]) resolve(results[0]);
                        else reject(new Error('Origin geocoding failed'));
                    });
                });

                const destResult = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
                    geocoder.geocode({ address: `${ride.destination}, Agra, India` }, (results, status) => {
                        if (status === 'OK' && results && results[0]) resolve(results[0]);
                        else reject(new Error('Destination geocoding failed'));
                    });
                });

                originLat = originResult.geometry.location.lat();
                originLng = originResult.geometry.location.lng();
                destLat = destResult.geometry.location.lat();
                destLng = destResult.geometry.location.lng();
            }

            // Try Generoute API first
            try {
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
                    if (data.routes && data.routes[0]) {
                        const route = data.routes[0];
                        const path = route.geometry.coordinates.map((coord: [number, number]) => ({
                            lat: coord[1],
                            lng: coord[0]
                        }));

                        // Draw blue route polyline
                        new google.maps.Polyline({
                            path: path,
                            geodesic: true,
                            strokeColor: '#4285F4',
                            strokeOpacity: 0.8,
                            strokeWeight: 6,
                            map: googleMapRef.current
                        });

                        setDistance((route.distance / 1000).toFixed(1) + ' km');
                        setDuration(Math.round(route.duration / 60) + ' min');

                        // Fit bounds
                        const bounds = new google.maps.LatLngBounds();
                        path.forEach((point: any) => bounds.extend(point));
                        googleMapRef.current.fitBounds(bounds);
                    }
                }
            } catch (error) {
                console.log('Generoute failed, using Google Directions');
            }

            // Fallback to Google Directions
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                map: googleMapRef.current,
                suppressMarkers: false,
                polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.8,
                    strokeWeight: 6
                }
            });

            directionsService.route({
                origin: { lat: originLat, lng: originLng },
                destination: { lat: destLat, lng: destLng },
                travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === 'OK' && result) {
                    directionsRenderer.setDirections(result);
                    const route = result.routes[0].legs[0];
                    setDistance(route.distance?.text || '');
                    setDuration(route.duration?.text || '');
                }
                setLoading(false);
            });

        } catch (error) {
            console.error('Route drawing error:', error);
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary/5 to-orange-50">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <Navigation className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Route Preview</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {ride.origin}
                                </span>
                                <span>→</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {ride.destination}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative">
                    <div ref={mapRef} className="w-full h-[600px]" />
                    
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-600 font-medium">Loading route...</p>
                            </div>
                        </div>
                    )}

                    {!loading && (distance || duration) && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-100">
                            <div className="flex items-center gap-6">
                                {distance && (
                                    <div className="flex items-center gap-2">
                                        <Navigation className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Distance</p>
                                            <p className="text-lg font-bold text-slate-800">{distance}</p>
                                        </div>
                                    </div>
                                )}
                                {duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Duration</p>
                                            <p className="text-lg font-bold text-slate-800">{duration}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
