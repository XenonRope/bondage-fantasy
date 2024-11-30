import { Exception } from "@adonisjs/core/exceptions";
import { ErrorCode } from "bondage-fantasy-common";

export class ApplicationException extends Exception {
  constructor(params: { code: ErrorCode; message: string; status: number }) {
    super(params.message, {
      code: params.code,
      status: params.status,
    });
  }
}

export class UsernameAlreadyTakenException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_USERNAME_ALREADY_TAKEN,
      message: "Username was already taken",
      status: 422,
    });
  }
}
