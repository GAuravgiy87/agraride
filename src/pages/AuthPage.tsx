import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Shield, Navigation, Users, ArrowRight, User, Mail, Lock, Phone, House } from 'lucide-react';
import { User as UserType } from '../types';

export const AuthPage = ({ onLogin }: { onLogin: (u: UserType) => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        gender: 'male'
    });
    const navigate = useNavigate();

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            onLogin(data);
            navigate(data.role === 'admin' ? '/admin' : '/');
        } else {
            setError(data.error);
        }
    };

    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            setIsLogin(true);
        } else {
            const data = await res.json();
            setError(data.error);
        }
    };

    const toggleAuth = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center overflow-hidden">
            <Link to="/" className="fixed top-6 left-6 z-50 p-2.5 bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <House className="w-3.5 h-3.5 text-primary" /> Back Home
            </Link>

            <div className="w-full h-full p-8 flex items-center justify-center">
                <div className="relative w-full h-full max-w-6xl max-h-[800px] bg-slate-50 rounded-[2.5rem] overflow-hidden flex shadow-2xl border border-slate-100">

                    {/* Animated Content Column */}
                    <motion.div
                        initial={false}
                        animate={{
                            x: isLogin ? '0%' : '100%',
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute inset-y-0 left-0 w-1/2 hidden lg:flex flex-col justify-center p-12 z-20 pointer-events-none"
                    >
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="login-info"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-5"
                                >
                                    <div className="relative w-full h-24 mb-6 rounded-2xl bg-primary/5 border border-primary/10 overflow-hidden flex items-center justify-center pointer-events-none">
                                        {/* Road Stripe */}
                                        <div className="absolute inset-x-0 bottom-8 h-1 bg-slate-200 opacity-20" />
                                        <div className="absolute inset-x-0 bottom-8 h-1 flex justify-center gap-6">
                                            {[...Array(6)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ x: [0, 40] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-full bg-slate-400/30 rounded-full shrink-0"
                                                />
                                            ))}
                                        </div>

                                        {/* Jumping Car Wrapper */}
                                        <motion.div
                                            animate={{
                                                y: [0, -4, 0],
                                                rotate: [0, 2, 0, -2, 0]
                                            }}
                                            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
                                            className="relative z-10"
                                        >
                                            <div className="relative">
                                                <Car className="text-primary w-12 h-12" strokeWidth={2.5} />

                                                {/* Speed Blur Lines */}
                                                <motion.div
                                                    animate={{ opacity: [0, 1, 0], x: [0, -25] }}
                                                    transition={{ duration: 0.4, repeat: Infinity }}
                                                    className="absolute -left-4 top-4 w-4 h-0.5 bg-primary/40 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{ opacity: [0, 1, 0], x: [0, -20] }}
                                                    transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                                                    className="absolute -left-2 top-6 w-3 h-0.5 bg-primary/40 rounded-full"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-display font-black tracking-tight text-slate-900 leading-tight">
                                            Agra<span className="text-primary">Ride</span>
                                        </h1>
                                        <p className="mt-3 text-base text-slate-500 font-medium leading-relaxed max-w-xs">
                                            The premium carpooling ecosystem for Agra's daily commuters.
                                        </p>
                                    </div>
                                    <div className="space-y-3 pt-2 text-xs">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Car className="text-primary w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-bold">Split Fuel Costs</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                            <span className="font-bold">Verified Commuters Only</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Navigation className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            <span className="font-bold">Shared Doorstep Pickups</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register-info"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <div className="relative w-full h-24 mb-6 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center pointer-events-none">
                                        {/* Traveling Group Animation */}
                                        <div className="absolute inset-x-0 bottom-8 h-1 flex justify-center gap-12">
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ x: [100, -100] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.6 }}
                                                    className="w-12 h-1 bg-indigo-200/50 rounded-full shrink-0"
                                                />
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-4 relative z-10">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <Car className="text-primary w-10 h-10" />
                                            </motion.div>
                                            <motion.div
                                                animate={{ x: [-10, 10, -10] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="flex -space-x-2"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-sm">
                                                    <User className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-sm">
                                                    <User className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-display font-black tracking-tight text-slate-900 leading-tight">
                                            Join <span className="text-primary">AgraRide</span>
                                        </h1>
                                        <p className="mt-3 text-base text-slate-500 font-medium leading-relaxed max-w-xs">
                                            Reduce Agra's traffic congestion while saving your daily travel expenses.
                                        </p>
                                    </div>
                                    <div className="bg-white/50 backdrop-blur p-5 rounded-2xl border border-white/50 shadow-sm max-w-xs space-y-3">
                                        <p className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Why Carpool?</p>
                                        <ul className="space-y-2">
                                            <li className="text-slate-500 text-[11px] font-medium flex gap-2">
                                                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                                                Save up to 60% on Monthly Fuel
                                            </li>
                                            <li className="text-slate-500 text-[11px] font-medium flex gap-2">
                                                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                                                Reduce City CO2 Emissions
                                            </li>
                                            <li className="text-slate-500 text-[11px] font-medium flex gap-2">
                                                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                                                Network with Like-minded People
                                            </li>
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Switchable Form Container */}
                    <div className="w-full flex relative">
                        <motion.div
                            initial={false}
                            animate={{
                                x: isLogin ? '100%' : '0%',
                            }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="w-full lg:w-1/2 h-full bg-white z-10 flex flex-col justify-center p-10 lg:p-14 shadow-[0_0_50px_rgba(0,0,0,0.05)] border-x border-slate-50 overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login-form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full max-w-sm mx-auto space-y-8"
                                    >
                                        <div className="text-center lg:text-left">
                                            <h2 className="text-3xl font-display font-black text-slate-900">Sign In</h2>
                                            <p className="text-slate-500 mt-2 font-medium">Log in to your sharing ecosystem.</p>
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold border border-red-100">
                                                {error}
                                            </div>
                                        )}

                                        <form onSubmit={handleLoginSubmit} className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        className="input-field !pl-12"
                                                        placeholder="you@email.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="password"
                                                        required
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        className="input-field !pl-12"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                                                    <span className="text-xs font-bold text-slate-500">Keep me logged in</span>
                                                </label>
                                                <button type="button" className="text-xs font-bold text-primary hover:underline">Support?</button>
                                            </div>
                                            <button className="btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-orange-200">
                                                Enter Workspace
                                            </button>
                                        </form>

                                        <div className="text-center mt-10">
                                            <p className="text-slate-500 font-bold text-sm">
                                                New here? <button onClick={toggleAuth} className="text-primary hover:underline">Register.</button>
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="register-form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full max-w-sm mx-auto space-y-6"
                                    >
                                        <div className="text-center lg:text-left">
                                            <h2 className="text-3xl font-display font-black text-slate-900">Create Account</h2>
                                            <p className="text-slate-500 mt-2 font-medium">Join the premium community today.</p>
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold border border-red-100">
                                                {error}
                                            </div>
                                        )}

                                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <input
                                                            required
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                            className="input-field !pl-12 !py-3"
                                                            placeholder="John Doe"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                                    <select
                                                        className="input-field !py-3"
                                                        value={formData.gender}
                                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                                    >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        required
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        className="input-field !pl-12 !py-3"
                                                        placeholder="you@example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        required
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        className="input-field !pl-12 !py-3"
                                                        placeholder="+91..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="password"
                                                        required
                                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                        className="input-field !pl-12 !py-3"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <button className="btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-orange-200">
                                                Create Account
                                            </button>
                                        </form>

                                        <div className="text-center mt-6">
                                            <p className="text-slate-500 font-bold text-sm">
                                                Already have an account? <button onClick={toggleAuth} className="text-primary hover:underline">Sign In</button>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};
