import { Exception } from "@adonisjs/core/exceptions";

export class UsernameAlreadyTakenException extends Exception {
  constructor() {
    super("Username was already taken", {
      code: "E_USERNAME_ALREADY_TAKEN",
      status: 422,
    });
  }
}
