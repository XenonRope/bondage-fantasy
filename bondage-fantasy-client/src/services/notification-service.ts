import { notifications } from "@mantine/notifications";

class NotificationService {
  success(title: string | null, message: string): void {
    notifications.show({
      title,
      message,
      color: "green",
    });
  }

  error(title: string | null, message: string): void {
    notifications.show({
      title,
      message,
      color: "red",
    });
  }
}

export const notificationService = new NotificationService();
