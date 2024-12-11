import vine from "@vinejs/vine";
import {
  NPC_NAME_MAX_LENGTH,
  NPC_NAME_MIN_LENGTH,
} from "bondage-fantasy-common";

export const npcCreateRequestValidator = vine.compile(
  vine.object({
    zoneId: vine.number().withoutDecimals(),
    name: vine
      .string()
      .minLength(NPC_NAME_MIN_LENGTH)
      .maxLength(NPC_NAME_MAX_LENGTH),
  }),
);
