import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, PlusCircle, Shield, MapPin, IndianRupee } from 'lucide-react';

export const Home = () => (
    <div className="relative">
        {/* Hero Section */}
        <div className="relative bg-ink py-32 md:py-48 overflow-hidden">
            <div className="absolute inset-0 opacity-30">
                <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1920"
                    alt="Taj Mahal"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/80 to-ink" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-8 border border-primary/30">
                        Agra's #1 Carpool Network
                    </span>
                    <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-8 tracking-tighter leading-[0.9]">
                        Travel Together,<br />
                        <span className="text-primary">Save Together.</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        The safest and most reliable carpooling network for Agra. Connect with verified commuters and travel sustainably across the city.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/search" className="btn-primary !px-10 !py-5 text-lg flex items-center justify-center gap-3">
                            <Search className="w-6 h-6" /> Find a Ride
                        </Link>
                        <Link to="/offer" className="btn-secondary !bg-white/10 !text-white !border-white/20 !backdrop-blur-md !px-10 !py-5 text-lg flex items-center justify-center gap-3 hover:!bg-white/20">
                            <PlusCircle className="w-6 h-6" /> Offer a Ride
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 py-32">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Why choose AgraRide?</h2>
                <p className="text-slate-500 max-w-xl mx-auto">Built specifically for the unique needs of Agra's daily commuters and travelers.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
                {[
                    { icon: Shield, title: "Verified Profiles", desc: "Every user is verified through a rigorous process for a safe and secure journey.", color: "bg-blue-50 text-blue-600" },
                    { icon: MapPin, title: "Live Tracking", desc: "Share your live location with family and friends. Real-time GPS tracking for every ride.", color: "bg-emerald-50 text-emerald-600" },
                    { icon: IndianRupee, title: "Cost Effective", desc: "Split fuel costs and save up to 70% on your daily commute while reducing traffic.", color: "bg-orange-50 text-orange-600" }
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
                    >
                        <div className={`${f.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>
                            <f.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-display font-bold mb-4">{f.title}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <f.icon className="w-32 h-32" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </div>
);
