import { isErrorResponse } from "../utils/error";
import { notificationService } from "./notification-service";

class ErrorService {
  handleUnexpectedError(error: unknown) {
    const message = isErrorResponse(error)
      ? `Error code: ${error.code}. Message: "${error.message}".`
      : "Something went wrong...";
    notificationService.error("Unexpected error", message);
  }
}

export const errorService = new ErrorService();
