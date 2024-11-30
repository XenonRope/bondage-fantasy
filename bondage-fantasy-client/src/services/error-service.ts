import { isErrorResponse } from "../utils/error";
import { notificationService } from "./notification-service";
import { t } from "i18next";

class ErrorService {
  handleUnexpectedError(error: unknown) {
    const message = isErrorResponse(error)
      ? t("error.errorMessage", { code: error.code, message: error.message })
      : t("error.somethingWentWrong");
    notificationService.error(t("error.unexpecterError"), message);
  }
}

export const errorService = new ErrorService();
