import vine from "@vinejs/vine";
import {
  ZONE_DESCRIPTION_MAX_LENGTH,
  ZONE_DESCRIPTION_MIN_LENGTH,
  ZONE_FIELD_DESCRIPTION_MAX_LENGTH,
  ZONE_FIELD_DESCRIPTION_MIN_LENGTH,
  ZONE_FIELD_NAME_MAX_LENGTH,
  ZONE_FIELD_NAME_MIN_LENGTH,
  ZONE_MAX_HEIGHT,
  ZONE_MAX_WIDTH,
  ZONE_NAME_MAX_LENGTH,
  ZONE_NAME_MIN_LENGTH,
} from "bondage-fantasy-common";

const zoneFieldPosition = vine.object({
  x: vine
    .number()
    .withoutDecimals()
    .min(0)
    .max(ZONE_MAX_WIDTH - 1),
  y: vine
    .number()
    .withoutDecimals()
    .min(0)
    .max(ZONE_MAX_HEIGHT - 1),
});

const zoneField = vine.object({
  position: zoneFieldPosition,
  name: vine
    .string()
    .minLength(ZONE_FIELD_NAME_MIN_LENGTH)
    .maxLength(ZONE_FIELD_NAME_MAX_LENGTH),
  description: vine
    .string()
    .minLength(ZONE_FIELD_DESCRIPTION_MIN_LENGTH)
    .maxLength(ZONE_FIELD_DESCRIPTION_MAX_LENGTH),
});

const zoneFieldConnection = vine.object({
  positions: vine.array(zoneFieldPosition).fixedLength(2),
});

export const zoneCreateRequestValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(ZONE_NAME_MIN_LENGTH)
      .maxLength(ZONE_NAME_MAX_LENGTH),
    description: vine
      .string()
      .minLength(ZONE_DESCRIPTION_MIN_LENGTH)
      .maxLength(ZONE_DESCRIPTION_MAX_LENGTH),
    fields: vine.array(zoneField),
    connections: vine.array(zoneFieldConnection),
  }),
);
