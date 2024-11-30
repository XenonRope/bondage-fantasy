import { notifications } from "@mantine/notifications";

class NotificationService {
  error(title: string, message: string): void {
    notifications.show({
      title,
      message,
      color: "red",
    });
  }
}

export const notificationService = new NotificationService();
