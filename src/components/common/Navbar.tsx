import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, MessageSquare, User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../../types';
import { AnimatedLogo } from './AnimatedLogo';

export const Navbar = ({ user, onLogout }: { user: UserType | null, onLogout: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <AnimatedLogo />
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        {user?.role === 'admin' ? (
                            <>
                                <Link to="/admin" className="text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-wider flex items-center gap-1">
                                    <Shield className="w-4 h-4" /> Admin Dashboard
                                </Link>
                                <Link to="/inbox" className="text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Inbox
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/search" className="text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-wider transition-colors">Find a Ride</Link>
                                <Link to="/offer" className="text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-wider transition-colors">Offer a Ride</Link>
                                {user && (
                                    <>
                                        <Link to="/my-rides" className="text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-wider transition-colors">My Rides</Link>
                                        <Link to="/my-bookings" className="text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-wider transition-colors">My Bookings</Link>
                                        <Link to="/inbox" className="text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Inbox
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                        {user ? (
                            <div className="flex items-center space-x-4 pl-4 border-l border-slate-100">
                                <Link to="/profile" className="flex items-center space-x-2 text-ink bg-slate-50 px-4 py-2 rounded-full border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-sm">{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="btn-primary !py-2 !px-6 !text-sm"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4"
                    >
                        <Link to="/search" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Find a Ride</Link>
                        <Link to="/offer" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Offer a Ride</Link>
                        {user && (
                            <>
                                <Link to="/my-rides" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>My Rides</Link>
                                <Link to="/my-bookings" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>My Bookings</Link>
                                <Link to="/inbox" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Inbox</Link>
                                <Link to="/profile" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Profile</Link>
                            </>
                        )}
                        {user?.role === 'admin' && <Link to="/admin" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Admin</Link>}
                        {user ? (
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left text-red-500 font-medium">Logout</button>
                        ) : (
                            <Link to="/login" className="block bg-primary text-white text-center py-3 rounded-xl font-bold" onClick={() => setIsOpen(false)}>Login</Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
