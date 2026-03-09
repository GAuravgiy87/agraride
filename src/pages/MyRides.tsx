import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Car, ChevronRight, Edit, Trash2, Clock, MapPin, IndianRupee, Users, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { User as UserType } from '../types';
import { BookingRequests } from '../components/booking/BookingRequests';
import { GoogleMap } from '../components/ride/GoogleMap';

export const MyRides = ({ user }: { user: UserType | null }) => {
    const [rides, setRides] = useState<any[]>([]);
    const [editingRide, setEditingRide] = useState<any>(null);
    const [trackingRide, setTrackingRide] = useState<any>(null);
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        departure_time: '',
        available_seats: 4,
        price_per_seat: 50
    });

    useEffect(() => {
        if (!user) return;
        fetchRides();
    }, [user]);

    const fetchRides = () => {
        if (!user) return;
        fetch(`/api/rides/driver/${user.id}`)
            .then(res => res.json())
            .then(setRides);
    };

    const completeRide = async (rideId: number) => {
        const res = await fetch(`/api/rides/complete/${rideId}`, { method: 'POST' });
        if (res.ok) {
            setRides(rides.map(r => r.id === rideId ? { ...r, status: 'completed' } : r));
        }
    };

    const deleteRide = async (rideId: number) => {
        if (!confirm('Are you sure you want to delete this ride?')) return;
        const res = await fetch(`/api/rides/${rideId}`, { method: 'DELETE' });
        if (res.ok) {
            setRides(rides.filter(r => r.id !== rideId));
            alert('Ride deleted successfully!');
        }
    };

    const startEdit = (ride: any) => {
        setEditingRide(ride);
        setFormData({
            origin: ride.origin,
            destination: ride.destination,
            departure_time: new Date(ride.departure_time).toISOString().slice(0, 16),
            available_seats: ride.available_seats,
            price_per_seat: ride.price_per_seat
        });
    };

    const saveEdit = async () => {
        if (!editingRide) return;
        const res = await fetch(`/api/rides/${editingRide.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            alert('Ride updated successfully!');
            setEditingRide(null);
            fetchRides();
        }
    };

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h2 className="text-4xl font-display font-black tracking-tight">My Offered Rides</h2>
                <p className="text-slate-500 mt-2 font-medium">Manage the rides you've shared with the community.</p>
            </div>

            {user && <BookingRequests user={user} />}

            <div className="grid gap-6 md:gap-8">
                {rides.map(ride => {
                    const isUpcoming = new Date(ride.departure_time) > new Date();
                    return (
                        <div key={ride.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                                <div className="flex items-start md:items-center gap-4 md:gap-6 flex-1">
                                    <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-[1rem] md:rounded-[1.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                                        <Car className="text-slate-400 group-hover:text-primary transition-colors w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center flex-wrap gap-2 md:gap-3 text-base md:text-lg font-display font-bold text-ink mb-2">
                                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 shrink-0" />
                                            <span>{ride.origin}</span>
                                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-slate-300 shrink-0" />
                                            <span>{ride.destination}</span>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-3 md:gap-4 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-1">
                                                <Clock className={`w-3 h-3 ${isUpcoming ? 'text-emerald-500' : 'text-red-500'}`} />
                                                <span className={isUpcoming ? 'text-emerald-600' : 'text-red-600'}>
                                                    {formatDistanceToNow(new Date(ride.departure_time), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {ride.available_seats} seats
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <IndianRupee className="w-3 h-3" />
                                                ₹{ride.price_per_seat}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center flex-wrap gap-2 md:gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                                    <span className={`badge text-xs px-2 py-1 md:text-sm md:px-3 md:py-1 ${ride.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                        {ride.status}
                                    </span>
                                    {ride.status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => setTrackingRide(ride)}
                                                className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl hover:bg-blue-100 transition-colors"
                                                title="Track Live"
                                            >
                                                <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={() => startEdit(ride)}
                                                className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl hover:bg-blue-100 transition-colors"
                                                title="Edit Ride"
                                            >
                                                <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteRide(ride.id)}
                                                className="p-2 md:p-3 bg-red-50 text-red-600 rounded-lg md:rounded-xl hover:bg-red-100 transition-colors"
                                                title="Delete Ride"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={() => completeRide(ride.id)}
                                                className="btn-secondary !bg-slate-900 !text-white !border-none !py-2 !px-4 md:!py-3 md:!px-8 text-xs md:text-sm"
                                            >
                                                Complete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {rides.length === 0 && (
                    <div className="text-center py-16 md:py-32 bg-white rounded-[2rem] md:rounded-[4rem] border border-dashed border-slate-200 mx-4">
                        <Car className="w-12 h-12 md:w-16 md:h-16 text-slate-100 mx-auto mb-4 md:mb-6" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No rides offered yet</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingRide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setEditingRide(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <h3 className="text-xl md:text-2xl font-display font-black text-ink mb-4 md:mb-6">Edit Ride</h3>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Origin</label>
                                    <input
                                        type="text"
                                        value={formData.origin}
                                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Destination</label>
                                    <input
                                        type="text"
                                        value={formData.destination}
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Departure Time</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.departure_time}
                                        onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Available Seats</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="8"
                                            value={formData.available_seats}
                                            onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Price per Seat (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.price_per_seat}
                                            onChange={(e) => setFormData({ ...formData, price_per_seat: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
                                <button
                                    onClick={saveEdit}
                                    className="btn-primary flex-1 py-3 md:!py-4"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditingRide(null)}
                                    className="btn-secondary flex-1 py-3 md:!py-4"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Tracking Modal */}
            <AnimatePresence>
                {trackingRide && (
                    <GoogleMap
                        ride={trackingRide}
                        currentUser={user}
                        onClose={() => setTrackingRide(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
