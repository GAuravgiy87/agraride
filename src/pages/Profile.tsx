import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User as UserIcon, Phone, Mail, Car, Star, Award, TrendingUp, Shield } from 'lucide-react';
import { User as UserType } from '../types';
import { StarRating } from '../components/ride/StarRating';

export const Profile = ({ user }: { user: UserType | null }) => {
    const [ratings, setRatings] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [stats, setStats] = useState({ totalRides: 0, completedRides: 0, totalBookings: 0 });

    useEffect(() => {
        if (!user) return;

        // Fetch ratings
        fetch(`/api/ratings/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setRatings(data.ratings || []);
                setAvgRating(data.average || 0);
            });

        // Fetch user stats
        Promise.all([
            fetch(`/api/rides/driver/${user.id}`).then(r => r.json()),
            fetch(`/api/bookings/passenger/${user.id}`).then(r => r.json())
        ]).then(([rides, bookings]) => {
            setStats({
                totalRides: rides.length,
                completedRides: rides.filter((r: any) => r.status === 'completed').length,
                totalBookings: bookings.length
            });
        });
    }, [user]);

    if (!user) return <Navigate to="/login" />;

    const successRate = stats.totalRides > 0 ? Math.round((stats.completedRides / stats.totalRides) * 100) : 0;

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h2 className="text-4xl font-display font-black tracking-tight">My Profile</h2>
                <p className="text-slate-500 mt-2 font-medium">Manage your account and view your activity</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                                <UserIcon className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-display font-black text-ink mb-2">{user.name}</h3>
                            <span className="badge bg-primary/10 text-primary mb-6">
                                {user.role === 'admin' ? 'Administrator' : 'Member'}
                            </span>

                            <div className="w-full space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Email</p>
                                        <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                                    </div>
                                </div>

                                {user.phone && (
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Phone</p>
                                            <a href={`tel:${user.phone}`} className="text-sm font-bold text-primary hover:underline">
                                                {user.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {user.gender && (
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Gender</p>
                                            <p className="text-sm font-bold text-ink capitalize">{user.gender}</p>
                                        </div>
                                    </div>
                                )}

                                {user.vehicle_type && (
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                            <Car className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Vehicle</p>
                                            <p className="text-sm font-bold text-ink">{user.vehicle_type}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {avgRating > 0 && (
                                <div className="w-full pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                                        <span className="text-3xl font-display font-black text-ink">{avgRating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Average Rating</p>
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <StarRating rating={avgRating} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Rides</p>
                                    <p className="text-2xl font-display font-black text-ink">{stats.totalRides}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Completed</p>
                                    <p className="text-2xl font-display font-black text-ink">{stats.completedRides}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Success Rate</p>
                                    <p className="text-2xl font-display font-black text-ink">{successRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bookings Stats */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h3 className="text-xl font-display font-black text-ink mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Car className="w-5 h-5 text-primary" />
                            </div>
                            Booking Activity
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">Total Bookings</p>
                                <p className="text-3xl font-display font-black text-ink">{stats.totalBookings}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">Rides Offered</p>
                                <p className="text-3xl font-display font-black text-ink">{stats.totalRides}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ratings & Reviews */}
                    {ratings.length > 0 && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h3 className="text-xl font-display font-black text-ink mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-orange-400" />
                                </div>
                                Recent Reviews
                            </h3>
                            <div className="space-y-4">
                                {ratings.slice(0, 5).map((rating: any) => (
                                    <div key={rating.id} className="bg-slate-50 p-6 rounded-2xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-bold text-ink">{rating.rater_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {new Date(rating.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <StarRating rating={rating.rating} />
                                            </div>
                                        </div>
                                        {rating.comment && (
                                            <p className="text-sm text-slate-600 italic">"{rating.comment}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ratings.length === 0 && (
                        <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 text-center">
                            <Star className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews yet</p>
                            <p className="text-slate-400 text-sm mt-2">Complete rides to receive ratings from other users</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
