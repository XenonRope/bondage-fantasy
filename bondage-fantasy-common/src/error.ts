export enum ErrorCode {
  E_USERNAME_ALREADY_TAKEN = "E_USERNAME_ALREADY_TAKEN",
}

export interface ErrorResponse {
  code?: ErrorCode;
  message?: string;
}
