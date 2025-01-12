import vine from "@vinejs/vine";
import {
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_DESCRIPTION_MIN_LENGTH,
  ITEM_NAME_MAX_LENGTH,
  ITEM_NAME_MIN_LENGTH,
  ITEM_SEARCH_QUERY_MAX_LENGTH,
  ITEM_SEARCH_QUERY_MIN_LENGTH,
  ItemSlot,
} from "bondage-fantasy-common";

export const itemSaveRequestValidator = vine.compile(
  vine.object({
    itemId: vine.number().withoutDecimals().optional(),
    slots: vine.array(vine.enum(ItemSlot)),
    name: vine
      .string()
      .minLength(ITEM_NAME_MIN_LENGTH)
      .maxLength(ITEM_NAME_MAX_LENGTH),
    description: vine
      .string()
      .minLength(ITEM_DESCRIPTION_MIN_LENGTH)
      .maxLength(ITEM_DESCRIPTION_MAX_LENGTH),
  }),
);

export const itemSearchRequestValidator = vine.compile(
  vine.object({
    query: vine
      .string()
      .minLength(ITEM_SEARCH_QUERY_MIN_LENGTH)
      .maxLength(ITEM_SEARCH_QUERY_MAX_LENGTH),
    offset: vine.number().withoutDecimals().min(0),
    limit: vine.number().withoutDecimals().min(0),
  }),
);
