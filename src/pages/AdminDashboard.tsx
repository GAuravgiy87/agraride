import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertCircle, User, Map as MapIcon, Users, Car, ChevronRight, TrendingUp } from 'lucide-react';
import { User as UserType } from '../types';
import { DatabaseManager } from '../components/admin/DatabaseManager';
import { SimulatedMap } from '../components/ride/SimulatedMap';

export const AdminDashboard = ({ user }: { user: UserType | null }) => {
    const [stats, setStats] = useState<any>(null);
    const [selectedRide, setSelectedRide] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'security'>('overview');
    const navigate = useNavigate();

    const fetchStats = () => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(setStats);
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll for SOS updates
        return () => clearInterval(interval);
    }, [user, navigate]);

    const resolveSOS = async (id: number) => {
        await fetch(`/api/sos/resolve/${id}`, { method: 'POST' });
        fetchStats();
    };

    if (!stats) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                <div>
                    <h2 className="text-4xl font-display font-black tracking-tight flex items-center gap-4">
                        <Shield className="text-primary w-10 h-10" /> Admin Control
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Real-time overview of the AgraRide ecosystem.</p>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Security {stats.activeSOS.length > 0 && <span className="ml-2 bg-white text-red-600 px-2 py-0.5 rounded-full text-[10px]">{stats.activeSOS.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'database' ? 'bg-primary text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Database
                    </button>
                </div>
            </div>

            {activeTab === 'security' && (
                <div className="space-y-12">
                    {/* SOS Alerts */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-display font-bold flex items-center gap-3 text-red-600">
                            <AlertCircle /> Active SOS Alerts
                        </h3>
                        <div className="grid gap-6">
                            {stats.activeSOS.map((sos: any) => (
                                <div key={sos.id} className="bg-red-50 border-2 border-red-100 rounded-[3rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 animate-pulse">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-red-600 text-white p-3 rounded-2xl">
                                                <User />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-red-400 uppercase tracking-widest">Alert Triggered By</p>
                                                <h4 className="text-xl font-bold text-red-900">{sos.user_name}</h4>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Driver</p>
                                                <p className="font-bold text-red-900">{sos.driver_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Passengers</p>
                                                <p className="font-bold text-red-900">{sos.passengers || 'None'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setSelectedRide({ id: sos.ride_id, origin: sos.origin, destination: sos.destination, driver_name: sos.driver_name, driver_id: sos.driver_id })}
                                            className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all"
                                        >
                                            <MapIcon className="w-5 h-5" /> Track Live
                                        </button>
                                        <button
                                            onClick={() => resolveSOS(sos.id)}
                                            className="bg-white text-red-600 border border-red-200 px-8 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all"
                                        >
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {stats.activeSOS.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">No active SOS alerts. System secure.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Bookings (Who with whom) */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                            <Users /> Passenger-Driver Pairings
                        </h3>
                        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                                            <th className="px-10 py-6">Passenger</th>
                                            <th className="px-10 py-6">With Driver</th>
                                            <th className="px-10 py-6">Route</th>
                                            <th className="px-10 py-6">Status</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {stats.detailedBookings.map((b: any) => (
                                            <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-8 font-bold text-ink">{b.passenger_name}</td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-2">
                                                        <Car className="w-4 h-4 text-primary" />
                                                        <span className="font-bold text-slate-700">{b.driver_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <span className="text-slate-400">{b.origin}</span>
                                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                                        <span className="text-slate-400">{b.destination}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`badge ${b.ride_status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {b.ride_status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <button
                                                        onClick={() => setSelectedRide({ id: b.ride_id, origin: b.origin, destination: b.destination, driver_name: b.driver_name })}
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        <MapIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'overview' && (
                <>
                    <div className="grid md:grid-cols-3 gap-10 mb-16">
                        {[
                            { label: 'Total Users', value: stats.users, icon: User, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
                            { label: 'Active Rides', value: stats.rides, icon: Car, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
                            { label: 'Total Bookings', value: stats.bookings, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' }
                        ].map((s, i) => (
                            <div key={i} className={`bg-white p-10 rounded-[3.5rem] border ${s.border} shadow-xl shadow-slate-200/50 relative overflow-hidden group`}>
                                <div className={`${s.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                    <s.icon className="w-8 h-8" />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{s.label}</p>
                                <h3 className="text-5xl font-display font-black mt-2 tracking-tighter">{s.value}</h3>
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <s.icon className="w-32 h-32" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="text-2xl font-display font-bold">Recent Ride Activity</h3>
                            <button className="btn-secondary !py-2 !px-6 !text-xs !uppercase !tracking-widest">View All Logs</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                                        <th className="px-10 py-6">Driver</th>
                                        <th className="px-10 py-6">Route Path</th>
                                        <th className="px-10 py-6">Departure</th>
                                        <th className="px-10 py-6">Status</th>
                                        <th className="px-10 py-6 text-right">Monitoring</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recentRides.map((ride: any) => (
                                        <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <span className="font-bold text-ink">{ride.driver_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3 text-sm font-medium">
                                                    <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{ride.origin}</span>
                                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                                    <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{ride.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-sm text-slate-500 font-medium">
                                                {new Date(ride.departure_time).toLocaleString()}
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button
                                                    onClick={() => setSelectedRide(ride)}
                                                    className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 hover:bg-primary hover:text-white hover:border-primary transition-all mx-auto md:ml-auto md:mr-0"
                                                >
                                                    <MapIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'database' && (
                <DatabaseManager />
            )}

            <AnimatePresence>
                {selectedRide && (
                    <SimulatedMap
                        ride={selectedRide}
                        currentUser={user}
                        onClose={() => setSelectedRide(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
