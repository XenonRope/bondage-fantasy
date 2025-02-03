import vine from "@vinejs/vine";
import {
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_DESCRIPTION_MIN_LENGTH,
  ITEM_NAME_MAX_LENGTH,
  ITEM_NAME_MIN_LENGTH,
  ITEM_SEARCH_QUERY_MAX_LENGTH,
  ITEM_SEARCH_QUERY_MIN_LENGTH,
  ItemSlot,
  ItemType,
} from "bondage-fantasy-common";

export const itemSaveRequestValidator = vine.compile(
  vine
    .object({
      itemId: vine.number().withoutDecimals().optional(),
      name: vine
        .string()
        .minLength(ITEM_NAME_MIN_LENGTH)
        .maxLength(ITEM_NAME_MAX_LENGTH),
      description: vine
        .string()
        .minLength(ITEM_DESCRIPTION_MIN_LENGTH)
        .maxLength(ITEM_DESCRIPTION_MAX_LENGTH),
    })
    .merge(
      vine.group([
        vine.group.if((data) => data.type === ItemType.STORABLE, {
          type: vine.literal(ItemType.STORABLE),
        }),
        vine.group.if((data) => data.type === ItemType.WEARABLE, {
          type: vine.literal(ItemType.WEARABLE),
          slots: vine.array(vine.enum(ItemSlot)).distinct().minLength(1),
        }),
      ]),
    ),
);

export const itemSearchRequestValidator = vine.compile(
  vine.object({
    query: vine
      .string()
      .minLength(ITEM_SEARCH_QUERY_MIN_LENGTH)
      .maxLength(ITEM_SEARCH_QUERY_MAX_LENGTH),
    offset: vine.number().withoutDecimals().min(0),
    limit: vine.number().withoutDecimals().min(0).max(1000),
    includeItemsIds: vine
      .array(vine.number().withoutDecimals())
      .maxLength(1000)
      .optional(),
    types: vine.array(vine.enum(ItemType)).distinct().optional(),
  }),
);
