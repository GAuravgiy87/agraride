import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Car } from 'lucide-react';
import { User as UserType } from './types';

// Components
import { Navbar } from './components/common/Navbar';
import { Inbox } from './components/common/Inbox';

// Pages
import { Home } from './pages/Home';
import { AuthPage } from './pages/AuthPage';
import { SearchRides } from './pages/SearchRides';
import { OfferRide } from './pages/OfferRide';
import { MyRides } from './pages/MyRides';
import { MyBookings } from './pages/MyBookings';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';

const AppContent = ({ user, handleLogin, handleLogout }: {
  user: UserType | null,
  handleLogin: (u: UserType) => void,
  handleLogout: () => void
}) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar user={user} onLogout={handleLogout} />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/register" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/search" element={<SearchRides user={user} />} />
          <Route path="/offer" element={<OfferRide user={user} />} />
          <Route path="/my-rides" element={<MyRides user={user} />} />
          <Route path="/my-bookings" element={<MyBookings user={user} />} />
          <Route path="/inbox" element={<Inbox user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </main>

      {!isAuthPage && (
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <Car className="text-primary w-5 h-5" />
              <span className="font-display font-bold text-white text-lg">AgraRide</span>
            </div>

            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              © 2026 Carpooling for a sustainable Agra.
            </p>

            <div className="flex space-x-6 text-[10px] uppercase tracking-[0.2em] font-black">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('agraride_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: UserType) => {
    setUser(u);
    localStorage.setItem('agraride_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agraride_user');
  };

  return (
    <Router>
      <AppContent user={user} handleLogin={handleLogin} handleLogout={handleLogout} />
    </Router>
  );
}
