/**
 * API Service - Singleton Pattern
 * Handles all HTTP requests to the backend
 */
class ApiService {
  private static instance: ApiService;
  private baseURL: string;

  private constructor() {
    // Use relative URLs so Vite proxy works in dev and same-origin works in prod
    this.baseURL = "/api";
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch {}
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // ── Auth ──────────────────────────────────────────────

  async login(credentials: { email: string; password: string }) {
    // Server returns flat user object — wrap it to match repository expectations
    const user = await this.request<any>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return { user, token: "" };
  }

  async register(userData: any) {
    const user = await this.request<any>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return { user, token: "" };
  }

  async getCurrentUser() {
    // Not a real endpoint — return from localStorage
    const saved = localStorage.getItem("agraride_user");
    const user = saved ? JSON.parse(saved) : null;
    return { user };
  }

  // ── Rides ─────────────────────────────────────────────

  async getRides(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters)}` : "";
    const rides = await this.request<any[]>(`/rides${query}`);
    return { rides };
  }

  async createRide(rideData: any) {
    const ride = await this.request<any>("/rides", {
      method: "POST",
      body: JSON.stringify(rideData),
    });
    return { ride };
  }

  async updateRide(rideId: number, rideData: any) {
    const ride = await this.request<any>(`/rides/${rideId}`, {
      method: "PUT",
      body: JSON.stringify(rideData),
    });
    return { ride };
  }

  async deleteRide(rideId: number) {
    return this.request(`/rides/${rideId}`, { method: "DELETE" });
  }

  // ── Bookings ──────────────────────────────────────────

  async getBookings(userId: number) {
    const bookings = await this.request<any[]>(`/bookings/passenger/${userId}`);
    return { bookings };
  }

  async createBooking(bookingData: any) {
    const booking = await this.request<any>("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
    return { booking };
  }

  async updateBooking(bookingId: number, status: string) {
    const booking = await this.request<any>(`/bookings/${bookingId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return { booking };
  }

  // ── Notifications (stub — no backend endpoint yet) ────

  async getNotifications(_userId: number) {
    return { notifications: [] };
  }

  async markNotificationRead(_notificationId: number) {
    return {};
  }
}

export const apiService = ApiService.getInstance();
