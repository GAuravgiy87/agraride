/**
 * API Service - Singleton Pattern
 * Handles all HTTP requests to the backend
 */
class ApiService {
  private static instance: ApiService;
  private baseURL: string;

  private constructor() {
    this.baseURL =
      process.env.NODE_ENV === "production"
        ? "https://api.agraride.com"
        : "http://localhost:3000";
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // User endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any) {
    return this.request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>("/auth/me");
  }

  // Ride endpoints
  async getRides(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters)}` : "";
    return this.request<{ rides: any[] }>(`/rides${query}`);
  }

  async createRide(rideData: any) {
    return this.request<{ ride: any }>("/rides", {
      method: "POST",
      body: JSON.stringify(rideData),
    });
  }

  async updateRide(rideId: number, rideData: any) {
    return this.request<{ ride: any }>(`/rides/${rideId}`, {
      method: "PUT",
      body: JSON.stringify(rideData),
    });
  }

  async deleteRide(rideId: number) {
    return this.request(`/rides/${rideId}`, {
      method: "DELETE",
    });
  }

  // Booking endpoints
  async getBookings(userId: number) {
    return this.request<{ bookings: any[] }>(`/bookings?user_id=${userId}`);
  }

  async createBooking(bookingData: any) {
    return this.request<{ booking: any }>("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(bookingId: number, status: string) {
    return this.request<{ booking: any }>(`/bookings/${bookingId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Notification endpoints
  async getNotifications(userId: number) {
    return this.request<{ notifications: any[] }>(
      `/notifications?user_id=${userId}`,
    );
  }

  async markNotificationRead(notificationId: number) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }
}

export const apiService = ApiService.getInstance();
