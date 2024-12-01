import { Exception } from "@adonisjs/core/exceptions";
import { CHARACTERS_MAX_COUNT, ErrorCode } from "bondage-fantasy-common";

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

export class InvalidUsernameOrPasswordException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_INVALID_USERNAME_OF_PASSWORD,
      message: "Invalid username or password",
      status: 401,
    });
  }
}

export class TooManyCharactersException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_TOO_MANY_CHARACTERS,
      message: `Account cannot have more than ${CHARACTERS_MAX_COUNT} characters`,
      status: 422,
    });
  }
}

export class CannotAcquireLockException extends ApplicationException {
  constructor(lockName: string) {
    super({
      code: ErrorCode.E_CANNOT_ACQUIRE_LOCK,
      message: `Cannot acquire lock "${lockName}". Try later.`,
      status: 503,
    });
  }
}

export class InvalidZoneException extends ApplicationException {
  constructor(message: string) {
    super({
      code: ErrorCode.E_INVALID_ZONE,
      message,
      status: 422,
    });
  }
}
