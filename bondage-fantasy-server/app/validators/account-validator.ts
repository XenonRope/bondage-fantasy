import vine from "@vinejs/vine";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "bondage-fantasy-common";

export const registerAccountValidator = vine.compile(
  vine.object({
    username: vine
      .string()
      .minLength(USERNAME_MIN_LENGTH)
      .maxLength(USERNAME_MAX_LENGTH)
      .alphaNumeric(),
    password: vine
      .string()
      .minLength(PASSWORD_MIN_LENGTH)
      .maxLength(PASSWORD_MAX_LENGTH),
  }),
);
