export enum ErrorCode {
  E_USERNAME_ALREADY_TAKEN = "E_USERNAME_ALREADY_TAKEN",
  E_INVALID_USERNAME_OF_PASSWORD = "E_INVALID_USERNAME_OF_PASSWORD",
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
}
