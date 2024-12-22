import vine from "@vinejs/vine";
import {
  ObjectType,
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
  ZONE_SEARCH_QUERY_MAX_LENGTH,
  ZONE_SEARCH_QUERY_MIN_LENGTH,
} from "bondage-fantasy-common";

const position = vine.object({
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
  position: position,
  name: vine
    .string()
    .minLength(ZONE_FIELD_NAME_MIN_LENGTH)
    .maxLength(ZONE_FIELD_NAME_MAX_LENGTH),
  description: vine
    .string()
    .minLength(ZONE_FIELD_DESCRIPTION_MIN_LENGTH)
    .maxLength(ZONE_FIELD_DESCRIPTION_MAX_LENGTH),
  canLeave: vine.boolean(),
});

const zoneFieldConnection = vine.object({
  positions: vine.array(position).fixedLength(2),
});

export const zoneSearchRequestValidator = vine.compile(
  vine.object({
    query: vine
      .string()
      .minLength(ZONE_SEARCH_QUERY_MIN_LENGTH)
      .maxLength(ZONE_SEARCH_QUERY_MAX_LENGTH),
    offset: vine.number().withoutDecimals().min(0),
    limit: vine.number().withoutDecimals().min(0),
  }),
);

export const zoneRequestNpcObject = vine.object({
  id: vine.number().withoutDecimals().optional(),
  type: vine.literal(ObjectType.NPC),
  position: position,
  npcId: vine.number().withoutDecimals(),
});

export const zoneRequestObject = vine.unionOfTypes([zoneRequestNpcObject]);

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
    draft: vine.boolean(),
    entrance: position,
    fields: vine.array(zoneField),
    connections: vine.array(zoneFieldConnection),
    objects: vine.array(zoneRequestObject),
  }),
);

export const zoneEditRequestValidator = vine.compile(
  vine.object({
    zoneId: vine.number().withoutDecimals(),
    name: vine
      .string()
      .minLength(ZONE_NAME_MIN_LENGTH)
      .maxLength(ZONE_NAME_MAX_LENGTH),
    description: vine
      .string()
      .minLength(ZONE_DESCRIPTION_MIN_LENGTH)
      .maxLength(ZONE_DESCRIPTION_MAX_LENGTH),
    draft: vine.boolean(),
    entrance: position,
    fields: vine.array(zoneField),
    connections: vine.array(zoneFieldConnection),
    objects: vine.array(zoneRequestObject),
  }),
);

export const zoneJoinRequestValidator = vine.compile(
  vine.object({
    zoneId: vine.number().withoutDecimals(),
  }),
);

export const zoneMoveRequestValidator = vine.compile(
  vine.object({
    destination: position,
  }),
);
