import { ErrorCode, ErrorResponse } from "bondage-fantasy-common";

export function isErrorResponseWithCode(
  error: unknown,
  code: ErrorCode,
): error is ErrorResponse {
  return isErrorResponse(error) && error.code === code;
}

export function isErrorResponse(error: unknown): error is ErrorResponse {
  return (
    typeof error === "object" &&
    error != null &&
    "code" in error &&
    typeof error.code === "string"
  );
}
