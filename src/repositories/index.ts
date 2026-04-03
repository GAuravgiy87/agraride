import { User, Ride, Booking } from "../types";
import { apiService } from "../services/ApiService";

/**
 * Base Repository Interface
 */
interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

/**
 * User Repository - Repository Pattern
 */
class UserRepository implements IRepository<User> {
  private static instance: UserRepository;

  private constructor() {}

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async findAll(): Promise<User[]> {
    try {
      const response = await apiService.getCurrentUser();
      return [response.user];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const response = await apiService.getCurrentUser();
      return response.user.id === id ? response.user : null;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  async create(data: Partial<User>): Promise<User> {
    try {
      const response = await apiService.register(data);
      localStorage.setItem("agraride_user", JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    // In a real app, this would call an update endpoint
    // For now, we'll simulate with local storage
    const user = await this.findById(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...data };
    localStorage.setItem("agraride_user", JSON.stringify(updatedUser));
    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    // Users typically aren't deleted, just deactivated
    throw new Error("User deletion not supported");
  }

  // Additional methods
  async login(credentials: { email: string; password: string }): Promise<User> {
    try {
      const response = await apiService.login(credentials);
      localStorage.setItem("agraride_user", JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("agraride_user");
  }

  getCurrentUser(): User | null {
    try {
      const saved = localStorage.getItem("agraride_user");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }
}

/**
 * Ride Repository
 */
class RideRepository implements IRepository<Ride> {
  private static instance: RideRepository;

  private constructor() {}

  public static getInstance(): RideRepository {
    if (!RideRepository.instance) {
      RideRepository.instance = new RideRepository();
    }
    return RideRepository.instance;
  }

  async findAll(): Promise<Ride[]> {
    try {
      const response = await apiService.getRides();
      return response.rides;
    } catch (error) {
      console.error("Failed to fetch rides:", error);
      return [];
    }
  }

  async findById(id: number): Promise<Ride | null> {
    try {
      const rides = await this.findAll();
      return rides.find((ride) => ride.id === id) || null;
    } catch (error) {
      console.error("Failed to fetch ride:", error);
      return null;
    }
  }

  async create(data: Partial<Ride>): Promise<Ride> {
    try {
      const response = await apiService.createRide(data);
      return response.ride;
    } catch (error) {
      console.error("Failed to create ride:", error);
      throw error;
    }
  }

  async update(id: number, data: Partial<Ride>): Promise<Ride> {
    try {
      const response = await apiService.updateRide(id, data);
      return response.ride;
    } catch (error) {
      console.error("Failed to update ride:", error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiService.deleteRide(id);
    } catch (error) {
      console.error("Failed to delete ride:", error);
      throw error;
    }
  }

  // Additional methods
  async searchRides(filters: any): Promise<Ride[]> {
    try {
      const response = await apiService.getRides(filters);
      return response.rides;
    } catch (error) {
      console.error("Failed to search rides:", error);
      return [];
    }
  }

  async getUserRides(userId: number): Promise<Ride[]> {
    try {
      const rides = await this.findAll();
      return rides.filter((ride) => ride.driver_id === userId);
    } catch (error) {
      console.error("Failed to get user rides:", error);
      return [];
    }
  }
}

/**
 * Booking Repository
 */
class BookingRepository implements IRepository<Booking> {
  private static instance: BookingRepository;

  private constructor() {}

  public static getInstance(): BookingRepository {
    if (!BookingRepository.instance) {
      BookingRepository.instance = new BookingRepository();
    }
    return BookingRepository.instance;
  }

  async findAll(): Promise<Booking[]> {
    // This would typically get all bookings for the current user
    const user = userRepository.getCurrentUser();
    if (!user) return [];

    try {
      const response = await apiService.getBookings(user.id);
      return response.bookings;
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      return [];
    }
  }

  async findById(id: number): Promise<Booking | null> {
    try {
      const bookings = await this.findAll();
      return bookings.find((booking) => booking.id === id) || null;
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      return null;
    }
  }

  async create(data: Partial<Booking>): Promise<Booking> {
    try {
      const response = await apiService.createBooking(data);
      return response.booking;
    } catch (error) {
      console.error("Failed to create booking:", error);
      throw error;
    }
  }

  async update(id: number, data: Partial<Booking>): Promise<Booking> {
    try {
      const response = await apiService.updateBooking(
        id,
        data.status as string,
      );
      return response.booking;
    } catch (error) {
      console.error("Failed to update booking:", error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    // Bookings are typically cancelled, not deleted
    await this.update(id, { status: "cancelled" });
  }

  // Additional methods
  async getUserBookings(userId: number): Promise<Booking[]> {
    try {
      const response = await apiService.getBookings(userId);
      return response.bookings;
    } catch (error) {
      console.error("Failed to get user bookings:", error);
      return [];
    }
  }
}

// Export singleton instances
export const userRepository = UserRepository.getInstance();
export const rideRepository = RideRepository.getInstance();
export const bookingRepository = BookingRepository.getInstance();
