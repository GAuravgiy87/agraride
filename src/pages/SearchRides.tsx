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
    const [pendingBookings, setPendingBookings] = useState<Set<number>>(new Set());
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
        const interval = setInterval(fetchBookingStatus, 5000);
        return () => clearInterval(interval);
    }, [user]);

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
            setPendingBookings(prev => new Set([...prev, rideId]));
            const updated = await fetch('/api/rides').then(r => r.json());
            setRides(updated);
        } else {
            const data = await res.json();
            alert(data.error || "Failed to book ride");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Available Rides</h1>
                        <p className="text-gray-600 mt-2">Find commuters traveling your way in Agra</p>
                    </div>
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input 
                            placeholder="Search landmarks..." 
                            className="outline-none flex-1 text-sm font-medium" 
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Finding Rides...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
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
                                    className={`card-elevated p-6 ${isDisabled && !isOwnRide ? 'opacity-60' : ''} ${isOwnRide ? 'border-2 border-orange-200 bg-orange-50/30' : ''}`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                                    <User className="text-gray-500 w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 flex items-center space-x-2">
                                                        <span>{ride.driver_name}</span>
                                                        {isOwnRide && (
                                                            <span className="badge-primary text-xs">YOUR RIDE</span>
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center space-x-3 mt-1">
                                                        <span className="badge-success text-xs">Verified</span>
                                                        <span className="badge-neutral text-xs">
                                                            {ride.driver_gender || 'Male'}
                                                        </span>
                                                        <span className="badge-primary text-xs">
                                                            {ride.driver_vehicle || '4-wheeler'}
                                                        </span>
                                                        <div className="flex items-center space-x-1">
                                                            <StarRating rating={ride.avg_rating || 5} />
                                                            <span className="text-gray-500 text-xs font-medium">{(ride.avg_rating || 5).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center space-x-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pickup</span>
                                                    <span className="font-bold text-gray-900">{ride.origin}</span>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dropoff</span>
                                                    <span className="font-bold text-gray-900">{ride.destination}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center space-x-6 lg:border-l lg:border-gray-200 lg:pl-6">
                                            <div className={`flex flex-col items-center px-4 py-3 rounded-lg border ${
                                                new Date(ride.departure_time) > new Date() 
                                                    ? 'bg-green-50 border-green-200' 
                                                    : 'bg-red-50 border-red-200'
                                            }`}>
                                                <Clock className={`w-4 h-4 mb-1 ${
                                                    new Date(ride.departure_time) > new Date() 
                                                        ? 'text-green-600' 
                                                        : 'text-red-600'
                                                }`} />
                                                <span className={`text-sm font-bold ${
                                                    new Date(ride.departure_time) > new Date() 
                                                        ? 'text-green-600' 
                                                        : 'text-red-600'
                                                }`}>
                                                    {formatDistanceToNow(new Date(ride.departure_time), { addSuffix: false })}
                                                </span>
                                                <span className={`text-xs font-medium ${
                                                    new Date(ride.departure_time) > new Date() 
                                                        ? 'text-green-600' 
                                                        : 'text-red-600'
                                                }`}>
                                                    {new Date(ride.departure_time) > new Date() ? 'Starts In' : 'Started'}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-bold text-gray-900">₹{ride.price_per_seat}</span>
                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Per Seat</span>
                                            </div>

                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => setPreviewRide(ride)}
                                                    className="btn-secondary !px-4 !py-3 flex items-center space-x-2"
                                                    title="View Route"
                                                >
                                                    <MapIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => !isDisabled && setBookingRideId(isExpanding ? null : ride.id)}
                                                    disabled={isDisabled}
                                                    className={`btn-primary !px-6 !py-3 ${isExpanding ? '!bg-gray-600' : ''} ${isDisabled ? '!bg-gray-300 !text-gray-500 cursor-not-allowed' : ''}`}
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
                                                className="bg-gray-50 border-t border-gray-200 -mx-6 mt-6 px-6 py-6"
                                            >
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center space-x-2">
                                                            <Shield className="w-4 h-4 text-orange-600" />
                                                            <span>Driver Insights</span>
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="card p-4">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Success Rate</span>
                                                                <span className="text-xl font-bold text-gray-900">98%</span>
                                                            </div>
                                                            <div className="card p-4">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Completed</span>
                                                                <span className="text-xl font-bold text-gray-900">42 Rides</span>
                                                            </div>
                                                        </div>
                                                        {ride.driver_phone && (
                                                            <div className="card p-4">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Contact Number</span>
                                                                <a href={`tel:${ride.driver_phone}`} className="text-lg font-bold text-orange-600 hover:text-orange-700">
                                                                    {ride.driver_phone}
                                                                </a>
                                                            </div>
                                                        )}
                                                        <p className="text-gray-600 leading-relaxed italic">
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
                                                            className="flex items-center space-x-2 text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                            <span>Message Driver</span>
                                                        </button>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center space-x-2">
                                                            <TrendingUp className="w-4 h-4 text-orange-600" />
                                                            <span>Booking Summary</span>
                                                        </h4>
                                                        <div className="card p-6 space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600 font-medium">Available Seats</span>
                                                                <span className={`badge ${ride.available_seats === 0 ? 'badge-error' : 'badge-primary'}`}>
                                                                    {ride.available_seats === 0 ? 'FULL' : `${ride.available_seats} Seats`}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                                <div className={`h-full ${ride.available_seats === 0 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${(1 - ride.available_seats / 4) * 100}%` }} />
                                                            </div>
                                                            
                                                            {/* Counter Offer Section */}
                                                            <div className="pt-4 border-t border-gray-200">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-semibold text-gray-900">Price per Seat</span>
                                                                    <span className="text-2xl font-bold text-orange-600">₹{ride.price_per_seat}</span>
                                                                </div>
                                                                
                                                                {!showCounterOffer ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowCounterOffer(true);
                                                                            const suggestedPrice = Math.round(ride.price_per_seat * 0.8);
                                                                            setCounterOfferPrice(suggestedPrice > 0 ? suggestedPrice : ride.price_per_seat - 10);
                                                                        }}
                                                                        className="w-full mt-2 text-xs text-orange-600 font-semibold hover:text-orange-700 underline"
                                                                    >
                                                                        Make a Counter Offer
                                                                    </button>
                                                                ) : (
                                                                    <div className="mt-3 space-y-2">
                                                                        <label className="text-xs font-semibold text-gray-700">Your Offer (₹)</label>
                                                                        <div className="flex space-x-2">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={counterOfferPrice || ''}
                                                                                onChange={(e) => setCounterOfferPrice(parseInt(e.target.value))}
                                                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm font-semibold"
                                                                                placeholder="Enter your price"
                                                                            />
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowCounterOffer(false);
                                                                                    setCounterOfferPrice(null);
                                                                                }}
                                                                                className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                        {counterOfferPrice && counterOfferPrice < ride.price_per_seat && (
                                                                            <p className="text-xs text-green-600 font-semibold">
                                                                                Save ₹{ride.price_per_seat - counterOfferPrice}!
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                                                <span className="text-sm font-semibold text-gray-900">Total Payable</span>
                                                                <span className="text-2xl font-bold text-orange-600">
                                                                    ₹{counterOfferPrice || ride.price_per_seat}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-4">
                                                            {isOwnRide ? (
                                                                <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center">
                                                                    <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">This is your ride</p>
                                                                    <p className="text-xs text-gray-600 mt-2">You cannot book your own ride</p>
                                                                </div>
                                                            ) : hasPending ? (
                                                                <div className="flex-1 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                                                                    <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Request Pending</p>
                                                                    <p className="text-xs text-gray-600 mt-2">Waiting for driver approval</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleConfirmBooking(ride.id)}
                                                                        disabled={isDisabled}
                                                                        className={`btn-primary flex-1 !py-4 flex items-center justify-center space-x-2 ${isDisabled ? '!bg-gray-300 !text-gray-500 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <span>{isFull ? 'Seats Full' : hasBooked ? 'Already Booked' : counterOfferPrice ? 'Send Counter Offer' : 'Confirm'}</span>
                                                                        {!isDisabled && <ChevronRight className="w-4 h-4" />}
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => setSelectedRide(ride)}
                                                                className="btn-secondary !bg-gray-800 !text-white !border-none !py-4 flex items-center justify-center space-x-2"
                                                            >
                                                                <Navigation className="w-4 h-4" />
                                                                <span>Map</span>
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
                            <div className="text-center py-20 card-elevated">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                                    <Car className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No rides available right now</h3>
                                <p className="text-gray-600">Check back later or offer your own ride!</p>
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
        </div>
    );
};