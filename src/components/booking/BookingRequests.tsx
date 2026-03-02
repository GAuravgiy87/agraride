import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, User } from 'lucide-react';
import { User as UserType } from '../types';

export const BookingRequests = ({ user }: { user: UserType }) => {
    const [requests, setRequests] = useState<any[]>([]);

    const fetchRequests = () => {
        fetch(`/api/bookings/driver/${user.id}`)
            .then(res => res.json())
            .then(setRequests);
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleAction = async (id: number, action: 'accept' | 'reject') => {
        const res = await fetch(`/api/bookings/${action}/${id}`, { method: 'POST' });
        if (res.ok) fetchRequests();
    };

    if (requests.length === 0) return null;

    return (
        <div className="mb-16 space-y-6">
            <h3 className="text-2xl font-display font-black flex items-center gap-3">
                <Users className="text-primary w-8 h-8" /> Pending Requests
            </h3>
            <div className="grid gap-6">
                {requests.map(req => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[3rem] border-2 border-primary/10 shadow-xl shadow-orange-100/50 flex flex-col md:flex-row justify-between items-center gap-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                <User className="text-primary w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-ink">{req.passenger_name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                                        {req.passenger_gender || 'Male'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">{req.seats_booked} Seats Requested</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 font-medium">
                                    Route: <span className="text-ink font-bold">{req.origin} → {req.destination}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAction(req.id, 'accept')}
                                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'reject')}
                                className="bg-white text-slate-400 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                            >
                                Reject
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
