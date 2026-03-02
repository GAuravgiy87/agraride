import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PlusCircle, Car as CarIcon, Bike } from 'lucide-react';
import { User as UserType } from '../types';

export const OfferRide = ({ user }: { user: UserType | null }) => {
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        departure_time: '',
        available_seats: 3,
        price_per_seat: 100,
        vehicle_type: '4-wheeler' as '2-wheeler' | '4-wheeler',
        vehicle_description: ''
    });
    const navigate = useNavigate();

    if (!user) return <Navigate to="/login" />;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/rides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                driver_id: user.id,
                driver_vehicle: formData.vehicle_type,
                driver_vehicle_description: formData.vehicle_description
            })
        });
        if (res.ok) navigate('/search');
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12"
            >
                <div className="mb-10">
                    <h2 className="text-4xl font-display font-black tracking-tight">Offer a Ride</h2>
                    <p className="text-slate-500 mt-2 font-medium">Share your journey and help Agra travel better.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Vehicle Selection */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Vehicle Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, vehicle_type: '4-wheeler', available_seats: 3 })}
                                className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all border ${formData.vehicle_type === '4-wheeler'
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-orange-200'
                                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                    }`}
                            >
                                <CarIcon className="w-5 h-5" /> 4-Wheeler
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, vehicle_type: '2-wheeler', available_seats: 1 })}
                                className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all border ${formData.vehicle_type === '2-wheeler'
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-orange-200'
                                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                    }`}
                            >
                                <Bike className="w-5 h-5" /> 2-Wheeler
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Vehicle Details (e.g. Amaze White, Pulsar Black)</label>
                        <input
                            placeholder="e.g. Honda Amaze (White) - UP80 AB 1234"
                            className="input-field"
                            value={formData.vehicle_description}
                            onChange={e => setFormData({ ...formData, vehicle_description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Pickup Point</label>
                            <input
                                placeholder="e.g. Dayalbagh"
                                className="input-field"
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Drop Point</label>
                            <input
                                placeholder="e.g. Sanjay Place"
                                className="input-field"
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Departure Time</label>
                            <input
                                type="datetime-local"
                                className="input-field"
                                value={formData.departure_time}
                                onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Price per Seat (₹)</label>
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
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Available Seats</label>
                        <div className="flex gap-4">
                            {(formData.vehicle_type === '4-wheeler' ? [1, 2, 3, 4, 5, 6] : [1]).map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, available_seats: num })}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${formData.available_seats === num
                                        ? 'bg-primary text-white shadow-lg shadow-orange-200'
                                        : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn-primary w-full py-5 text-lg mt-4 flex items-center justify-center gap-3">
                        <PlusCircle className="w-6 h-6" /> Publish Ride
                    </button>
                </form>
            </motion.div>
        </div>
    );
};
