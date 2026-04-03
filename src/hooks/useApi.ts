import { useState, useEffect, useCallback } from "react";
import {
  userRepository,
  rideRepository,
  bookingRepository,
} from "../repositories";
import { User, Ride, Booking } from "../types";
import { validationService } from "../services/ValidationService";

/**
 * Hook for API data fetching with loading and error states
 */
export const useApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
};

/**
 * Hook for user authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    return userRepository.getCurrentUser();
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      setLoading(true);
      try {
        const loggedInUser = await userRepository.login(credentials);
        setUser(loggedInUser);
        return loggedInUser;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (userData: Partial<User> & { password: string }) => {
      setLoading(true);
      try {
        const newUser = await userRepository.create(userData);
        setUser(newUser);
        return newUser;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await userRepository.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) throw new Error("No user logged in");
      setLoading(true);
      try {
        const updatedUser = await userRepository.update(user.id, updates);
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };
};

/**
 * Hook for ride management
 */
export const useRides = (userId?: number) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRides = userId
        ? await rideRepository.getUserRides(userId)
        : await rideRepository.findAll();
      setRides(fetchedRides);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createRide = useCallback(async (rideData: Partial<Ride>) => {
    try {
      const newRide = await rideRepository.create(rideData);
      setRides((prev) => [newRide, ...prev]);
      return newRide;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateRide = useCallback(async (id: number, updates: Partial<Ride>) => {
    try {
      const updatedRide = await rideRepository.update(id, updates);
      setRides((prev) =>
        prev.map((ride) => (ride.id === id ? updatedRide : ride)),
      );
      return updatedRide;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteRide = useCallback(async (id: number) => {
    try {
      await rideRepository.delete(id);
      setRides((prev) => prev.filter((ride) => ride.id !== id));
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  return {
    rides,
    loading,
    error,
    refetch: fetchRides,
    createRide,
    updateRide,
    deleteRide,
  };
};

/**
 * Hook for booking management
 */
export const useBookings = (userId?: number) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedBookings = await bookingRepository.getUserBookings(userId);
      setBookings(fetchedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      const newBooking = await bookingRepository.create(bookingData);
      setBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateBooking = useCallback(
    async (id: number, updates: Partial<Booking>) => {
      try {
        const updatedBooking = await bookingRepository.update(id, updates);
        setBookings((prev) =>
          prev.map((booking) => (booking.id === id ? updatedBooking : booking)),
        );
        return updatedBooking;
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBooking,
  };
};

/**
 * Hook for form validation
 */
export const useFormValidation = (strategyName: string) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback(
    (data: Record<string, any>) => {
      const validationResult = validationService.validate(strategyName, data);
      const newErrors: Record<string, string> = {};
      let formIsValid = true;

      for (const [field, result] of Object.entries(validationResult)) {
        if (!result.isValid) {
          newErrors[field] = result.message || "Invalid value";
          formIsValid = false;
        }
      }

      setErrors(newErrors);
      setIsValid(formIsValid);
      return formIsValid;
    },
    [strategyName],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    setFieldError,
    clearFieldError,
  };
};

/**
 * Hook for responsive design breakpoints
 */
export const useBreakpoint = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

/**
 * Hook for local storage with TypeScript support
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};
