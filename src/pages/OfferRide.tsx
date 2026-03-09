import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Car as CarIcon, Bike, MapPin, Navigation } from 'lucide-react';
import { User as UserType } from '../types';
import { LocationPicker } from '../components/ride/LocationPicker';

export const OfferRide = ({ user }: { user: UserType | null }) => {
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        origin_lat: null as number | null,
        origin_lng: null as number | null,
        dest_lat: null as number | null,
        dest_lng: null as number | null,
        departure_time: '',
        available_seats: 3,
        price_per_seat: 100,
        vehicle_type: '4-wheeler' as '2-wheeler' | '4-wheeler',
        vehicle_description: ''
    });
    const [showOriginPicker, setShowOriginPicker] = useState(false);
    const [showDestPicker, setShowDestPicker] = useState(false);
    const navigate = useNavigate();

    if (!user) return <Navigate to="/login" />;

    const handleOriginSelect = (location: { name: string; lat: number; lng: number }) => {
        setFormData(prev => ({
            ...prev,
            origin: location.name,
            origin_lat: location.lat,
            origin_lng: location.lng
        }));
        console.log('Origin selected:', location);
    };

    const handleDestSelect = (location: { name: string; lat: number; lng: number }) => {
        setFormData(prev => ({
            ...prev,
            destination: location.name,
            dest_lat: location.lat,
            dest_lng: location.lng
        }));
        console.log('Destination selected:', location);
    };

    const handleUseCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                        const data = await res.json();
                        let locationName = 'Current Location';
                        if (data && data.display_name) {
                            locationName = data.display_name;
                        }
                        handleOriginSelect({ name: locationName, lat, lng });
                    } catch (e) {
                         handleOriginSelect({ name: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`, lat, lng });
                    }
                },
                (error) => alert('Could not get your location: ' + error.message)
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        const rideData = {
            driver_id: user.id,
            origin: formData.origin,
            destination: formData.destination,
            departure_time: formData.departure_time,
            available_seats: formData.available_seats,
            price_per_seat: formData.price_per_seat,
            driver_vehicle: formData.vehicle_type,
            driver_vehicle_description: formData.vehicle_description,
            origin_lat: formData.origin_lat,
            origin_lng: formData.origin_lng,
            dest_lat: formData.dest_lat,
            dest_lng: formData.dest_lng
        };
        
        console.log('Submitting ride data:', rideData);
        
        const res = await fetch('/api/rides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rideData)
        });
        
        if (res.ok) {
            const result = await res.json();
            console.log('Ride created:', result);
            navigate('/search');
        } else {
            const error = await res.json();
            console.error('Failed to create ride:', error);
            alert('Failed to create ride: ' + (error.error || 'Unknown error'));
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 md:p-12"
                >
                <div className="mb-8 md:mb-10">
                    <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight">Offer a Ride</h2>
                    <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">Share your journey and help Agra travel better.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    {/* Vehicle Selection */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Vehicle Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, vehicle_type: '4-wheeler', available_seats: 3 })}
                                className={`flex items-center justify-center gap-3 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all border ${formData.vehicle_type === '4-wheeler'
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-orange-200'
                                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                    }`}
                            >
                                <CarIcon className="w-5 h-5" /> 4-Wheeler
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, vehicle_type: '2-wheeler', available_seats: 1 })}
                                className={`flex items-center justify-center gap-3 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all border ${formData.vehicle_type === '2-wheeler'
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-orange-200'
                                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                    }`}
                            >
                                <Bike className="w-5 h-5" /> 2-Wheeler
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 ml-1">Vehicle Details (e.g. Amaze White, Pulsar Black)</label>
                        <input
                            placeholder="e.g. Honda Amaze (White) - UP80 AB 1234"
                            className="input-field"
                            value={formData.vehicle_description}
                            onChange={e => setFormData({ ...formData, vehicle_description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 ml-1">Pickup Point</label>
                            <div className="relative">
                                <input
                                    placeholder="e.g. Dayalbagh"
                                    className={`input-field pr-[80px] ${formData.origin_lat && formData.origin_lng ? 'font-bold text-slate-800' : ''}`}
                                    value={formData.origin}
                                    onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                    required
                                    readOnly={!!(formData.origin_lat && formData.origin_lng)}
                                />
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white pr-1">
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        className="p-2 rounded-xl transition-colors bg-blue-50 hover:bg-blue-100 text-blue-600 shadow-sm"
                                        title="Use Current Location"
                                    >
                                        <Navigation className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowOriginPicker(true)}
                                        className={`p-2 rounded-xl transition-colors shadow-sm ${
                                            formData.origin_lat && formData.origin_lng 
                                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                                : 'bg-primary/10 hover:bg-primary/20 text-primary'
                                        }`}
                                        title="Pick on Map"
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {formData.origin_lat && formData.origin_lng && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-green-600 font-mono">
                                        ✓ Location pinned: {formData.origin_lat.toFixed(4)}, {formData.origin_lng.toFixed(4)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, origin: '', origin_lat: null, origin_lng: null }))}
                                        className="text-xs text-red-500 hover:text-red-700 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 ml-1">Drop Point</label>
                            <div className="relative">
                                <input
                                    placeholder="e.g. Sanjay Place"
                                    className={`input-field pr-12 ${formData.dest_lat && formData.dest_lng ? 'font-bold text-slate-800' : ''}`}
                                    value={formData.destination}
                                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                    required
                                    readOnly={!!(formData.dest_lat && formData.dest_lng)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowDestPicker(true)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                                        formData.dest_lat && formData.dest_lng 
                                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                                            : 'bg-primary/10 hover:bg-primary/20 text-primary'
                                    }`}
                                    title="Pick on Map"
                                >
                                    <MapPin className="w-5 h-5" />
                                </button>
                            </div>
                            {formData.dest_lat && formData.dest_lng && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-green-600 font-mono">
                                        ✓ Location pinned: {formData.dest_lat.toFixed(4)}, {formData.dest_lng.toFixed(4)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, destination: '', dest_lat: null, dest_lng: null }))}
                                        className="text-xs text-red-500 hover:text-red-700 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 ml-1">Departure Time</label>
                            <input
                                type="datetime-local"
                                className="input-field"
                                value={formData.departure_time}
                                onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 ml-1">Price per Seat (₹)</label>
                            <input
                                type="number"
                                value={formData.price_per_seat}
                                className="input-field"
                                onChange={e => setFormData({ ...formData, price_per_seat: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 ml-1">Available Seats</label>
                        <div className="flex flex-wrap gap-2 md:gap-4">
                            {(formData.vehicle_type === '4-wheeler' ? [1, 2, 3, 4, 5, 6] : [1]).map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, available_seats: num })}
                                    className={`flex-1 min-w-[3rem] md:min-w-0 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all ${formData.available_seats === num
                                        ? 'bg-primary text-white shadow-lg shadow-orange-200'
                                        : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn-primary w-full py-4 md:py-5 text-base md:text-lg mt-2 md:mt-4 flex items-center justify-center gap-2 md:gap-3">
                        <PlusCircle className="w-5 h-5 md:w-6 md:h-6" /> Publish Ride
                    </button>
                </form>
            </motion.div>
        </div>

        <AnimatePresence>
            {showOriginPicker && (
                <LocationPicker
                    title="Select Pickup Point"
                    initialLocation={formData.origin}
                    onLocationSelect={handleOriginSelect}
                    onClose={() => setShowOriginPicker(false)}
                />
            )}
            {showDestPicker && (
                <LocationPicker
                    title="Select Drop Point"
                    initialLocation={formData.destination}
                    onLocationSelect={handleDestSelect}
                    onClose={() => setShowDestPicker(false)}
                />
            )}
        </AnimatePresence>
    </>
    );
};
