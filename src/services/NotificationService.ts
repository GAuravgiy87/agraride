import { Notification, NotificationType } from "../types/notification";

/**
 * Notification Service - Observer Pattern
 * Manages notifications and observers
 */
interface NotificationObserver {
  onNotification(notification: Notification): void;
}

class NotificationService {
  private static instance: NotificationService;
  private observers: NotificationObserver[] = [];
  private notifications: Notification[] = [];

  private constructor() {
    this.loadNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Observer pattern methods
  subscribe(observer: NotificationObserver): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer);
    };
  }

  private notifyObservers(notification: Notification): void {
    this.observers.forEach((observer) => {
      try {
        observer.onNotification(notification);
      } catch (error) {
        console.error("Error notifying observer:", error);
      }
    });
  }

  // Notification management
  addNotification(
    notification: Omit<Notification, "id" | "read" | "created_at">,
  ): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(), // Simple ID generation
      read: false,
      created_at: new Date().toISOString(),
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyObservers(newNotification);
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(
      (n) => n.id === notificationId,
    );
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.saveNotifications();
  }

  removeNotification(notificationId: number): void {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId,
    );
    this.saveNotifications();
  }

  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // Persistence
  private saveNotifications(): void {
    try {
      localStorage.setItem(
        "agraride_notifications",
        JSON.stringify(this.notifications),
      );
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }

  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem("agraride_notifications");
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      this.notifications = [];
    }
  }

  // Factory method for creating notifications
  static createNotification(
    type: NotificationType,
    title: string,
    message: string,
    userId: number,
    options: Partial<
      Pick<Notification, "ride_id" | "booking_id" | "action_url">
    > = {},
  ): Omit<Notification, "id" | "read" | "created_at"> {
    return {
      user_id: userId,
      type,
      title,
      message,
      ...options,
    };
  }
}

export const notificationService = NotificationService.getInstance();
export type { NotificationObserver };
