import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, X, Check } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface LocationPickerProps {
    title: string;
    initialLocation?: string;
    onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
    onClose: () => void;
}

export const LocationPicker = ({ title, initialLocation, onLocationSelect, onClose }: LocationPickerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialLocation || '');

    useEffect(() => {
        if (!mapRef.current || googleMapRef.current) return;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
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

        // Center on Agra
        const map = new google.maps.Map(mapRef.current, {
            zoom: 13,
            center: { lat: 27.1767, lng: 78.0081 },
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
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
        trafficButton.textContent = 'Traffic';
        trafficButton.className = 'bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors m-2';
        trafficButton.onclick = () => {
            if (trafficLayer.getMap()) {
                trafficLayer.setMap(null);
                trafficButton.style.backgroundColor = 'white';
            } else {
                trafficLayer.setMap(map);
                trafficButton.style.backgroundColor = '#FEF3C7';
            }
        };
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(trafficButton);

        // Add click listener to place marker
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                placeMarker(e.latLng);
            }
        });

        // Initialize search box
        const input = document.getElementById('location-search') as HTMLInputElement;
        if (input) {
            const searchBox = new google.maps.places.SearchBox(input);

            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces();
                if (places && places.length > 0) {
                    const place = places[0];
                    if (place.geometry && place.geometry.location) {
                        map.setCenter(place.geometry.location);
                        map.setZoom(15);
                        placeMarker(place.geometry.location, place.name);
                    }
                }
            });
        }
    };

    const placeMarker = (location: google.maps.LatLng, name?: string) => {
        if (!googleMapRef.current) return;

        // Remove existing marker
        if (markerRef.current) {
            markerRef.current.setMap(null);
        }

        // Create new marker with pin icon
        const marker = new google.maps.Marker({
            position: location,
            map: googleMapRef.current,
            animation: google.maps.Animation.DROP,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF5722" stroke="#ffffff" stroke-width="2"/>
                        <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(48, 48),
                anchor: new google.maps.Point(24, 48),
            },
        });

        markerRef.current = marker;

        // Immediately set location with coordinates (enables confirm button right away)
        const tempLocation = {
            name: name || 'Selected Location',
            lat: location.lat(),
            lng: location.lng()
        };
        setSelectedLocation(tempLocation);
        console.log('Location selected immediately:', tempLocation);

        // Then reverse geocode to get a better address name
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: location }, (results, status) => {
            console.log('Geocoding status:', status, results);
            if (status === 'OK' && results && results[0]) {
                // Extract a clean location name from the address
                let locationName = name;
                
                if (!locationName && results[0].address_components) {
                    // Try to get a meaningful name from address components
                    const components = results[0].address_components;
                    
                    // Priority: sublocality > locality > neighborhood > route
                    const sublocality = components.find(c => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'));
                    const locality = components.find(c => c.types.includes('locality'));
                    const neighborhood = components.find(c => c.types.includes('neighborhood'));
                    const route = components.find(c => c.types.includes('route'));
                    
                    locationName = (sublocality || locality || neighborhood || route)?.long_name || results[0].formatted_address;
                }
                
                const finalLocation = {
                    name: locationName || results[0].formatted_address,
                    lat: location.lat(),
                    lng: location.lng()
                };
                setSelectedLocation(finalLocation);
                setSearchQuery(locationName || results[0].formatted_address);
                console.log('Location updated with geocoded name:', finalLocation);
            } else {
                // If geocoding fails, keep the immediate location
                console.log('Geocoding failed, keeping immediate location');
                setSearchQuery(tempLocation.name);
            }
        });
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            console.log('Confirming location:', selectedLocation);
            onLocationSelect(selectedLocation);
            onClose();
        } else {
            alert('Please select a location on the map first');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <MapPin className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{title}</h3>
                            <p className="text-sm text-slate-500">Click on the map or search to select location</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative">
                    {/* Search Box */}
                    <input
                        id="location-search"
                        type="text"
                        placeholder="Search for a location in Agra..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="absolute top-4 left-4 right-20 z-10 px-4 py-3 rounded-2xl border-2 border-white shadow-xl outline-none focus:border-primary"
                    />

                    {/* Map */}
                    <div ref={mapRef} className="w-full h-[500px]" />

                    {/* Bottom Action Bar - Always Visible */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                {selectedLocation ? (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selected Location</p>
                                        <p className="font-bold text-slate-800">{selectedLocation.name}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">
                                            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">No Location Selected</p>
                                        <p className="text-sm text-slate-600">Click on the map or search to select a location</p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedLocation}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                                    selectedLocation 
                                        ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-orange-200' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <Check className="w-4 h-4" /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
