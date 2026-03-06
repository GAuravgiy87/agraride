import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Clock, IndianRupee, ChevronRight, Shield, MessageSquare, TrendingUp, Navigation, Car, Map as MapIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { User as UserType } from '../types';
import { StarRating } from '../components/ride/StarRating';
import { GoogleMap } from '../components/ride/GoogleMap';
import { RoutePreview } from '../components/ride/RoutePreview';

export const SearchRides = ({ user }: { user: UserType | null }) => {
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingRideId, setBookingRideId] = useState<number | null>(null);
    const [selectedRide, setSelectedRide] = useState<any>(null);
    const [previewRide, setPreviewRide] = useState<any>(null);
    const [userBookings, setUserBookings] = useState<Set<number>>(new Set());
    const [counterOfferPrice, setCounterOfferPrice] = useState<number | null>(null);
    const [showCounterOffer, setShowCounterOffer] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRides = async () => {
            const res = await fetch('/api/rides');
            const data = await res.json();

            const ridesWithRatings = await Promise.all(data.map(async (ride: any) => {
                const ratingRes = await fetch(`/api/ratings/${ride.driver_id}`);
                const ratingData = await ratingRes.json();
                return { ...ride, avg_rating: ratingData.average || 4.5 };
            }));

            setRides(ridesWithRatings);
            setLoading(false);
        };
        fetchRides();
    }, []);

    // Check for pending bookings
    const [pendingBookings, setPendingBookings] = useState<Set<number>>(new Set());
    
    const fetchBookingStatus = () => {
        if (!user) return;
        fetch(`/api/bookings/passenger/${user.id}`)
            .then(res => res.json())
            .then(bookings => {
                const pendingRideIds = new Set(
                    bookings
                        .filter((b: any) => b.status === 'pending')
                        .map((b: any) => b.ride_id)
                );
                setPendingBookings(pendingRideIds);
                
                const confirmedRideIds = new Set(
                    bookings
                        .filter((b: any) => b.status === 'confirmed')
                        .map((b: any) => b.ride_id)
                );
                setUserBookings(confirmedRideIds);
            });
    };
    
    useEffect(() => {
        fetchBookingStatus();
        // Refresh booking status every 5 seconds
        const interval = setInterval(fetchBookingStatus, 5000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const fetchRides = async () => {
            const res = await fetch('/api/rides');
            const data = await res.json();

            const ridesWithRatings = await Promise.all(data.map(async (ride: any) => {
                const ratingRes = await fetch(`/api/ratings/${ride.driver_id}`);
                const ratingData = await ratingRes.json();
                return { ...ride, avg_rating: ratingData.average || 4.5 };
            }));

            setRides(ridesWithRatings);
            setLoading(false);
        };
        fetchRides();
    }, []);

    const handleConfirmBooking = async (rideId: number) => {
        if (!user) return alert("Please login to book a ride");
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ride_id: rideId, 
                passenger_id: user.id, 
                seats_booked: 1,
                counter_offer_price: counterOfferPrice 
            })
        });
        if (res.ok) {
            const data = await res.json();
            alert(data.message);
            setBookingRideId(null);
            setCounterOfferPrice(null);
            setShowCounterOffer(false);
            // Add to pending bookings immediately
            setPendingBookings(prev => new Set([...prev, rideId]));
            const updated = await fetch('/api/rides').then(r => r.json());
            setRides(updated);
        } else {
            const data = await res.json();
            alert(data.error || "Failed to book ride");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black tracking-tight">Available Rides</h2>
                    <p className="text-slate-500 mt-2 font-medium">Find commuters traveling your way in Agra</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Search className="w-5 h-5 text-slate-400 ml-3" />
                    <input placeholder="Search landmarks..." className="outline-none py-2 px-2 text-sm font-medium w-64" />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Finding Rides...</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {rides.map(ride => {
                        const isExpanding = bookingRideId === ride.id;
                        const isFull = ride.available_seats === 0;
                        const hasBooked = userBookings.has(ride.id);
                        const hasPending = pendingBookings.has(ride.id);
                        const isOwnRide = user?.id === ride.driver_id;
                        const isDisabled = isFull || hasBooked || isOwnRide || hasPending;
                        
                        return (
                            <motion.div
                                key={ride.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200 transition-all overflow-hidden group ${isDisabled && !isOwnRide ? 'opacity-60' : ''} ${isOwnRide ? 'border-2 border-primary/30 bg-primary/5' : ''}`}
                            >
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                                                <User className="text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="font-display font-bold text-xl flex items-center gap-2">
                                                    {ride.driver_name}
                                                    {isOwnRide && (
                                                        <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                                            YOUR RIDE
                                                        </span>
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-100">Verified</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                                                        {ride.driver_gender || 'Male'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                                                        {ride.driver_vehicle || '4-wheeler'}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-orange-400">
                                                        <StarRating rating={ride.avg_rating || 5} />
                                                        <span className="text-slate-400 font-bold text-[10px] ml-1">{(ride.avg_rating || 5).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2">Pickup</span>
                                                <span className="font-display font-bold text-lg text-ink">{ride.origin}</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-8 h-px bg-slate-200 relative">
                                                    <ChevronRight className="absolute -top-2 -right-2 w-4 h-4 text-slate-300" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2">Dropoff</span>
                                                <span className="font-display font-bold text-lg text-ink">{ride.destination}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8 lg:border-l lg:border-slate-100 lg:pl-10">
                                        <div className={`flex flex-col items-center px-6 py-4 rounded-3xl border ${
                                            new Date(ride.departure_time) > new Date() 
                                                ? 'bg-emerald-50 border-emerald-100' 
                                                : 'bg-red-50 border-red-100'
                                        }`}>
                                            <Clock className={`w-4 h-4 mb-2 ${
                                                new Date(ride.departure_time) > new Date() 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`} />
                                            <span className={`text-lg font-black tracking-tighter leading-none ${
                                                new Date(ride.departure_time) > new Date() 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {formatDistanceToNow(new Date(ride.departure_time), { addSuffix: false })}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase mt-1 ${
                                                new Date(ride.departure_time) > new Date() 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {new Date(ride.departure_time) > new Date() ? 'Starts In' : 'Started'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-display font-black text-ink">₹{ride.price_per_seat}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Per Seat</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setPreviewRide(ride)}
                                                className="btn-secondary !px-6 !py-4 flex items-center gap-2"
                                                title="View Route"
                                            >
                                                <MapIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => !isDisabled && setBookingRideId(isExpanding ? null : ride.id)}
                                                disabled={isDisabled}
                                                className={`btn-primary !px-8 !py-4 ${isExpanding ? '!bg-slate-900 !shadow-none' : ''} ${isDisabled ? '!bg-slate-300 !text-slate-500 cursor-not-allowed' : ''}`}
                                            >
                                                {isOwnRide ? 'Your Ride' : isFull ? 'Full Seats' : hasBooked ? 'Booked' : hasPending ? 'Pending Approval' : isExpanding ? 'Cancel' : 'Book Ride'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanding && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-slate-50/50 border-t border-slate-100"
                                        >
                                            <div className="p-10 grid md:grid-cols-2 gap-12">
                                                <div className="space-y-6">
                                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-primary" /> Driver Insights
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Success Rate</span>
                                                            <span className="text-xl font-display font-bold text-ink">98%</span>
                                                        </div>
                                                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Completed</span>
                                                            <span className="text-xl font-display font-bold text-ink">42 Rides</span>
                                                        </div>
                                                    </div>
                                                    {ride.driver_phone && (
                                                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Contact Number</span>
                                                            <a href={`tel:${ride.driver_phone}`} className="text-lg font-display font-bold text-primary hover:underline">
                                                                {ride.driver_phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                    <p className="text-slate-500 leading-relaxed font-medium italic">
                                                        {ride.driver_vehicle_description
                                                            ? `Using: ${ride.driver_vehicle_description}. I travel daily from ${ride.origin} to ${ride.destination}.`
                                                            : `"I travel daily from ${ride.origin} to ${ride.destination} for work. Looking for friendly co-travelers to share the journey and fuel costs!"`}
                                                    </p>
                                                    <button
                                                        onClick={async () => {
                                                            if (!user) return alert("Login to chat");
                                                            await fetch('/api/messages', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    ride_id: ride.id,
                                                                    sender_id: user.id,
                                                                    receiver_id: ride.driver_id,
                                                                    content: "Hi! I'm interested in your ride."
                                                                })
                                                            });
                                                            navigate('/inbox');
                                                        }}
                                                        className="flex items-center gap-2 text-primary font-bold text-sm hover:underline group/msg"
                                                    >
                                                        <MessageSquare className="w-4 h-4 transition-transform group-hover/msg:-rotate-12" /> Message Driver
                                                    </button>
                                                </div>

                                                <div className="space-y-6">
                                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4 text-primary" /> Booking Summary
                                                    </h5>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-500 font-medium">Available Seats</span>
                                                            <span className={`badge ${ride.available_seats === 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-primary/10 text-primary'}`}>
                                                                {ride.available_seats === 0 ? 'FULL' : `${ride.available_seats} Seats`}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                                            <div className={`h-full ${ride.available_seats === 0 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${(1 - ride.available_seats / 4) * 100}%` }} />
                                                        </div>
                                                        
                                                        {/* Counter Offer Section */}
                                                        <div className="pt-4 border-t border-slate-50">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-bold text-ink">Price per Seat</span>
                                                                <span className="text-2xl font-display font-black text-primary">₹{ride.price_per_seat}</span>
                                                            </div>
                                                            
                                                            {!showCounterOffer ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setShowCounterOffer(true);
                                                                        const suggestedPrice = Math.round(ride.price_per_seat * 0.8);
                                                                        setCounterOfferPrice(suggestedPrice > 0 ? suggestedPrice : ride.price_per_seat - 10);
                                                                    }}
                                                                    className="w-full mt-2 text-xs text-orange-600 font-bold hover:text-orange-700 underline"
                                                                >
                                                                    Make a Counter Offer
                                                                </button>
                                                            ) : (
                                                                <div className="mt-3 space-y-2">
                                                                    <label className="text-xs font-bold text-slate-600">Your Offer (₹)</label>
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={counterOfferPrice || ''}
                                                                            onChange={(e) => setCounterOfferPrice(parseInt(e.target.value))}
                                                                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                                                                            placeholder="Enter your price"
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowCounterOffer(false);
                                                                                setCounterOfferPrice(null);
                                                                            }}
                                                                            className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                    {counterOfferPrice && counterOfferPrice < ride.price_per_seat && (
                                                                        <p className="text-xs text-emerald-600 font-bold">
                                                                            Save ₹{ride.price_per_seat - counterOfferPrice}!
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                                            <span className="text-sm font-bold text-ink">Total Payable</span>
                                                            <span className="text-2xl font-display font-black text-primary">
                                                                ₹{counterOfferPrice || ride.price_per_seat}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        {isOwnRide ? (
                                                            <div className="flex-1 bg-primary/10 border-2 border-primary/20 rounded-2xl p-6 text-center">
                                                                <p className="text-sm font-black text-primary uppercase tracking-wider">This is your ride</p>
                                                                <p className="text-xs text-slate-500 mt-2">You cannot book your own ride</p>
                                                            </div>
                                                        ) : hasPending ? (
                                                            <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
                                                                <p className="text-sm font-black text-orange-600 uppercase tracking-wider">Request Pending</p>
                                                                <p className="text-xs text-slate-500 mt-2">Waiting for driver approval</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleConfirmBooking(ride.id)}
                                                                    disabled={isDisabled}
                                                                    className={`btn-primary flex-1 !py-4 flex items-center justify-center gap-2 ${isDisabled ? '!bg-slate-300 !text-slate-500 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {isFull ? 'Seats Full' : hasBooked ? 'Already Booked' : counterOfferPrice ? 'Send Counter Offer' : 'Confirm'} {!isDisabled && <ChevronRight className="w-5 h-5" />}
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => setSelectedRide(ride)}
                                                            className="btn-secondary !bg-slate-900 !text-white !border-none !py-4 flex items-center justify-center gap-2"
                                                        >
                                                            <Navigation className="w-5 h-5" /> Map
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}

                    {rides.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Car className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-slate-400">No rides available right now</h3>
                            <p className="text-slate-400 mt-2 font-medium">Check back later or offer your own ride!</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {selectedRide && (
                    <GoogleMap
                        ride={selectedRide}
                        currentUser={user}
                        onClose={() => setSelectedRide(null)}
                    />
                )}
                {previewRide && (
                    <RoutePreview
                        ride={previewRide}
                        onClose={() => setPreviewRide(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
