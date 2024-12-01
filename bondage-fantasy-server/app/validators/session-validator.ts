import vine from "@vinejs/vine";

export const loginRequestValidator = vine.compile(
  vine.object({
    username: vine.string(),
    password: vine.string(),
  }),
);
