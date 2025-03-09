import vine from "@vinejs/vine";
import {
  IMAGE_MAX_SIZE,
  IMAGE_NAME_MAX_LENGTH,
  IMAGE_NAME_MIN_LENGTH,
  IMAGE_SEARCH_QUERY_MAX_LENGTH,
  IMAGE_SEARCH_QUERY_MIN_LENGTH,
} from "bondage-fantasy-common";

export const imageSaveRequestValidator = vine.compile(
  vine.object({
    json: vine.string(),
    image: vine.file({
      size: IMAGE_MAX_SIZE,
      extnames: ["jpeg", "jpg", "png"],
    }),
  }),
);

export const imageSaveRequestJsonValidator = vine.compile(
  vine.object({
    imageId: vine.number().withoutDecimals().optional(),
    name: vine
      .string()
      .minLength(IMAGE_NAME_MIN_LENGTH)
      .maxLength(IMAGE_NAME_MAX_LENGTH),
  }),
);

export const imageSearchRequestValidator = vine.compile(
  vine.object({
    query: vine
      .string()
      .minLength(IMAGE_SEARCH_QUERY_MIN_LENGTH)
      .maxLength(IMAGE_SEARCH_QUERY_MAX_LENGTH),
    offset: vine.number().withoutDecimals().min(0),
    limit: vine.number().withoutDecimals().min(0).max(1000),
    includeImagesIds: vine
      .array(vine.number().withoutDecimals())
      .maxLength(1000)
      .optional(),
  }),
);

export const imageListRequestValidator = vine.compile(
  vine.object({
    imagesIds: vine.array(vine.number().withoutDecimals()).maxLength(1000),
  }),
);
