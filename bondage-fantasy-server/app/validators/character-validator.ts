import vine from "@vinejs/vine";
import {
  CHARACTER_NAME_MAX_LENGTH,
  CHARACTER_NAME_MIN_LENGTH,
  Genitals,
  Pronouns,
} from "bondage-fantasy-common";

export const characterCreateRequestValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(CHARACTER_NAME_MIN_LENGTH)
      .maxLength(CHARACTER_NAME_MAX_LENGTH),
    pronouns: vine.enum(Pronouns),
    genitals: vine.enum(Genitals),
  }),
);
