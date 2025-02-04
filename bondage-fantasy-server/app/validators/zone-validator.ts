import vine from "@vinejs/vine";
import {
  ObjectType,
  ZONE_DESCRIPTION_MAX_LENGTH,
  ZONE_DESCRIPTION_MIN_LENGTH,
  ZONE_EVENT_MAX_COUNT,
  ZONE_EVENT_NAME_MAX_LENGTH,
  ZONE_EVENT_NAME_MIN_LENGTH,
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
import { expressionSource } from "./expression-validator.js";
import { sceneDefinition } from "./scene-validator.js";

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
  positions: vine.tuple([position, position]),
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

const eventObject = vine.object({
  type: vine.literal(ObjectType.EVENT),
  position: position,
  eventId: vine.number().withoutDecimals().min(1),
  name: vine
    .string()
    .minLength(ZONE_EVENT_NAME_MIN_LENGTH)
    .maxLength(ZONE_EVENT_NAME_MAX_LENGTH),
  condition: expressionSource.optional(),
  scene: vine.union([
    vine.union.if((value) => value == null, vine.literal(undefined).optional()),
    vine.union.else(sceneDefinition),
  ]),
});

const zoneObject = vine.unionOfTypes([eventObject]);

export const zoneSaveRequestValidator = vine.compile(
  vine.object({
    zoneId: vine.number().withoutDecimals().optional(),
    name: vine
      .string()
      .minLength(ZONE_NAME_MIN_LENGTH)
      .maxLength(ZONE_NAME_MAX_LENGTH),
    description: vine
      .string()
      .minLength(ZONE_DESCRIPTION_MIN_LENGTH)
      .maxLength(ZONE_DESCRIPTION_MAX_LENGTH),
    private: vine.boolean(),
    entrance: position,
    fields: vine.array(zoneField),
    connections: vine.array(zoneFieldConnection),
    objects: vine.array(zoneObject).maxLength(ZONE_EVENT_MAX_COUNT),
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

export const zoneInteractRequestValidator = vine.compile(
  vine.object({
    eventId: vine.number().withoutDecimals(),
  }),
);
