import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, PlusCircle, Shield, MapPin, IndianRupee } from 'lucide-react';

export const Home = () => (
    <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-white border-b border-gray-200">
            <div className="absolute inset-0 opacity-5">
                <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1920"
                    alt="Taj Mahal"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-4 py-2 rounded-md bg-orange-100 text-orange-800 text-sm font-semibold uppercase tracking-wide mb-8 border border-orange-200">
                        Agra's #1 Carpool Network
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Travel Together,<br />
                        <span className="text-orange-600">Save Together.</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        The most reliable carpooling network for Agra. Connect with verified commuters and travel sustainably across the city.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/search" className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2">
                            <Search className="w-5 h-5" />
                            <span>Find a Ride</span>
                        </Link>
                        <Link to="/offer" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2">
                            <PlusCircle className="w-5 h-5" />
                            <span>Offer a Ride</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why choose AgraRide?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">Built specifically for the unique needs of Agra's daily commuters and travelers.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: Shield, title: "Verified Profiles", desc: "Every user is verified through a rigorous process for a safe and secure journey.", color: "bg-orange-100 text-orange-600" },
                    { icon: MapPin, title: "Live Tracking", desc: "Share your live location with family and friends. Real-time GPS tracking for every ride.", color: "bg-green-100 text-green-600" },
                    { icon: IndianRupee, title: "Cost Effective", desc: "Split fuel costs and save up to 70% on your daily commute while reducing traffic.", color: "bg-blue-100 text-blue-600" }
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4 }}
                        className="card p-8"
                    >
                        <div className={`${f.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}>
                            <f.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </div>
);
