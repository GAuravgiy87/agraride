import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, X, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
    title: string;
    initialLocation?: string;
    onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
    onClose: () => void;
}

// Leaflet component to handle clicks
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

export const LocationPicker = ({ title, initialLocation, onLocationSelect, onClose }: LocationPickerProps) => {
    const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialLocation || '');
    const [isSearching, setIsSearching] = useState(false);

    // Default to Agra
    const defaultCenter: [number, number] = [27.1767, 78.0081];

    const handleMapClick = async (lat: number, lng: number) => {
        // Set immediate coordinates
        const tempLoc = { name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng };
        setSelectedLocation(tempLoc);

        // Fetch address from Nominatim (OpenStreetMap)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            
            if (data && data.display_name) {
                // Use the exact full address 
                const locationName = data.display_name;
                setSelectedLocation({ name: locationName, lat, lng });
                setSearchQuery(locationName);
            }
        } catch (e) {
            console.error('Reverse geocode error:', e);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            // Search restricted around Agra
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Agra')}&limit=1`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const item = data[0];
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                
                let locationName = item.display_name.split(',')[0];
                setSelectedLocation({ name: locationName, lat, lng });
            } else {
                alert('Location not found in Agra');
            }
        } catch (e) {
            console.error('Search error:', e);
            alert('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
            onClose();
        } else {
            alert('Please select a location on the map first');
        }
    };

    const customIcon = L.divIcon({
        html: `<div class="text-primary drop-shadow-lg"><svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <MapPin className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{title}</h3>
                            <p className="text-sm text-slate-500">Tap anywhere on the map or type to search</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative h-[500px] w-full">
                    {/* Search Box Overlay */}
                    <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
                        <input
                            type="text"
                            placeholder="Search for a location in Agra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-4 py-3 rounded-2xl border-2 border-white shadow-xl outline-none focus:border-primary"
                        />
                        <button 
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-primary text-white px-6 py-3 rounded-2xl shadow-xl font-bold hover:bg-orange-600 disabled:opacity-70"
                        >
                            {isSearching ? '...' : 'Search'}
                        </button>
                    </div>

                    {/* Leaflet Map */}
                    <MapContainer
                        center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : defaultCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        <MapEvents onMapClick={handleMapClick} />
                        
                        {selectedLocation && (
                            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={customIcon}>
                                <Popup>
                                    <div className="font-bold text-center">
                                        {selectedLocation.name}
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur p-4 rounded-2xl shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 truncate">
                                {selectedLocation ? (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selected Location</p>
                                        <p className="font-bold text-slate-800 truncate" title={selectedLocation.name}>{selectedLocation.name}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">
                                            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">No Location Selected</p>
                                        <p className="text-sm text-slate-600">Click on the map or use the search bar</p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedLocation}
                                className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
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
