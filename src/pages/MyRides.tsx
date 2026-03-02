import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Car, ChevronRight } from 'lucide-react';
import { User as UserType } from '../types';
import { BookingRequests } from '../components/booking/BookingRequests';

export const MyRides = ({ user }: { user: UserType | null }) => {
    const [rides, setRides] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/rides/driver/${user.id}`)
            .then(res => res.json())
            .then(setRides);
    }, [user]);

    const completeRide = async (rideId: number) => {
        const res = await fetch(`/api/rides/complete/${rideId}`, { method: 'POST' });
        if (res.ok) {
            setRides(rides.map(r => r.id === rideId ? { ...r, status: 'completed' } : r));
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

            <div className="grid gap-8">
                {rides.map(ride => (
                    <div key={ride.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                                <Car className="text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 text-lg font-display font-bold text-ink mb-1">
                                    <span>{ride.origin}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                    <span>{ride.destination}</span>
                                </div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(ride.departure_time).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={`badge ${ride.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                {ride.status}
                            </span>
                            {ride.status === 'active' && (
                                <button
                                    onClick={() => completeRide(ride.id)}
                                    className="btn-secondary !bg-slate-900 !text-white !border-none !py-3 !px-8 text-sm"
                                >
                                    Complete Ride
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {rides.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200">
                        <Car className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No rides offered yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};
