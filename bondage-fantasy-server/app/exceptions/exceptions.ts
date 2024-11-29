import { Exception } from "@adonisjs/core/exceptions";
import { ErrorCode } from "bondage-fantasy-common";

export class UsernameAlreadyTakenException extends Exception {
  constructor() {
    super("Username was already taken", {
      code: ErrorCode.E_USERNAME_ALREADY_TAKEN,
      status: 422,
    });
  }
}
