import { ErrorCode } from "bondage-fantasy-common";

export function isErrorWithCode(error: unknown, code: ErrorCode): boolean {
  return (
    typeof error === "object" &&
    error != null &&
    "code" in error &&
    error.code === code
  );
}
