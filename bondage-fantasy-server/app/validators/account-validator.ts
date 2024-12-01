import vine from "@vinejs/vine";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "bondage-fantasy-common";

export const accountRegisterRequestValidator = vine.compile(
  vine.object({
    username: vine
      .string()
      .minLength(USERNAME_MIN_LENGTH)
      .maxLength(USERNAME_MAX_LENGTH)
      .regex(USERNAME_PATTERN),
    password: vine
      .string()
      .minLength(PASSWORD_MIN_LENGTH)
      .maxLength(PASSWORD_MAX_LENGTH),
  }),
);
