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

export class CharacterNotFoundException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_CHARACTER_NOT_FOUND,
      message:
        "Character doesn't exist or you don't have permission to access it",
      status: 404,
    });
  }
}

export class ZoneNotFoundException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_ZONE_NOT_FOUND,
      message: "Zone doesn't exist or you don't have permission to access it",
      status: 404,
    });
  }
}

export class ZoneIsDraftException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_ZONE_IS_DRAFT,
      message: "Zone is marked as a draft",
      status: 422,
    });
  }
}

export class CharacterInZoneException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_CHARACTER_IN_ZONE,
      message: "Action is impossible because character is in zone",
      status: 422,
    });
  }
}

export class CharacterNotInZoneException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_CHARACTER_NOT_IN_ZONE,
      message: "Action is impossible because character is not in zone",
      status: 422,
    });
  }
}

export class AccountNotFoundException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_ACCOUNT_NOT_FOUND,
      message:
        "Account doesn't exist or you don't have permission to access it",
      status: 404,
    });
  }
}

export class CannotLeaveException extends ApplicationException {
  constructor(message: string) {
    super({
      code: ErrorCode.E_CANNOT_LEAVE,
      message,
      status: 422,
    });
  }
}

export class CannotMoveException extends ApplicationException {
  constructor(message: string) {
    super({
      code: ErrorCode.E_CANNOT_MOVE,
      message,
      status: 422,
    });
  }
}

export class NoAccessToZoneException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_NO_ACCESS_TO_ZONE,
      message: "You have no access to modify or see details of zone",
      status: 403,
    });
  }
}

export class SceneChoiceRequiredException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_SCENE_CHOICE_REQUIRED,
      message: "Choice is required",
      status: 422,
    });
  }
}

export class SceneInvalidChoiceException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_SCENE_INVALID_CHOICE,
      message: "Invalid choice",
      status: 422,
    });
  }
}

export class EventNotFoundException extends ApplicationException {
  constructor(eventId: number) {
    super({
      code: ErrorCode.E_EVENT_NOT_FOUND,
      message: `Event ${eventId} doesn't exist or you don't have permission to access it`,
      status: 404,
    });
  }
}

export class CannotInteractWithEventException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_CANNOT_INTERACT_WITH_EVENT,
      message: "Cannot interact with event",
      status: 422,
    });
  }
}

export class CharacterInSceneException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_CHARACTER_IN_SCENE,
      message: "Character is already in scene",
      status: 422,
    });
  }
}

export class CharacterNotInSceneException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_CHARACTER_NOT_IN_SCENE,
      message: "Character is not in scene",
      status: 422,
    });
  }
}

export class ItemNotFoundException extends ApplicationException {
  constructor(itemId: number) {
    super({
      code: ErrorCode.E_ITEM_NOT_FOUND,
      message: `Item ${itemId} doesn't exist or you don't have permission to access it`,
      status: 404,
    });
  }
}

export class NoAccessToItemException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.E_NO_ACCESS_TO_ITEM,
      message: "You have no access to modify or see details of item",
      status: 403,
    });
  }
}

export class InvalidItemException extends ApplicationException {
  constructor(message: string) {
    super({
      code: ErrorCode.E_INVALID_ITEM,
      message,
      status: 422,
    });
  }
}
