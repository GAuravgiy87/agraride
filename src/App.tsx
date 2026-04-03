import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Car, Facebook, Twitter, Instagram } from "lucide-react";
import { User as UserType } from "./types";

// Services and Repositories
import { userRepository } from "./repositories";

// Hooks
import { useAuth } from "./hooks/useApi";

// Contexts
import { ToastProvider } from "./contexts/ToastContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Components
import { ErrorBoundary } from "./components/error";

// Components
import { NotFound } from "./components/error/ErrorBoundary";
import { Navbar } from "./components/common/Navbar";
import { Inbox } from "./components/common/Inbox";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AnimatedLogo } from "./components/common/AnimatedLogo";

// Pages
import { Home } from "./pages/Home";
import { AuthPage } from "./pages/AuthPage";
import { SearchRides } from "./pages/SearchRides";
import { OfferRide } from "./pages/OfferRide";
import { MyRides } from "./pages/MyRides";
import { MyBookings } from "./pages/MyBookings";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Profile } from "./pages/Profile";
import { NotificationDemo } from "./components/demo/NotificationDemo";

const AppContent = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isSearchPage = location.pathname === "/search";

  // Use the auth hook for better state management
  const { user, login, register, logout, updateProfile } = useAuth();

  const handleUserUpdate = async (updatedUser: UserType) => {
    try {
      await updateProfile(updatedUser);
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar user={user} onLogout={logout} />}
      <main
        className={`grow ${isSearchPage ? "overflow-hidden h-screen pt-16" : ""}`}
      >
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={<AuthPage onLogin={login} onRegister={register} />}
            />
            <Route
              path="/register"
              element={<AuthPage onLogin={login} onRegister={register} />}
            />
            <Route path="/search" element={<SearchRides user={user} />} />
            <Route path="/offer" element={<OfferRide user={user} />} />
            <Route path="/my-rides" element={<MyRides user={user} />} />
            <Route path="/my-bookings" element={<MyBookings user={user} />} />
            <Route path="/inbox" element={<Inbox user={user} />} />
            <Route
              path="/profile"
              element={<Profile user={user} onUserUpdate={handleUserUpdate} />}
            />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route
              path="/demo/notifications"
              element={<NotificationDemo user={user} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {!isAuthPage && location.pathname !== "/search" && (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Car className="text-primary w-6 h-6" />
                  <span className="font-display font-bold text-white text-xl">
                    AgraRide
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Connecting Agra's commuters for a sustainable and affordable
                  travel experience.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="/search"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Find a Ride
                    </a>
                  </li>
                  <li>
                    <a
                      href="/offer"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Offer a Ride
                    </a>
                  </li>
                  <li>
                    <a
                      href="/my-rides"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      My Rides
                    </a>
                  </li>
                  <li>
                    <a
                      href="/my-bookings"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      My Bookings
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Safety Guidelines
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                  Legal
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                © 2026 AgraRide. All rights reserved. Carpooling for a
                sustainable Agra.
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-slate-500">Made with ❤️ in Agra</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <ToastProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ToastProvider>
    </Router>
  );
}
