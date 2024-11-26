import vine from "@vinejs/vine";

export const registerAccountValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(8).maxLength(30).alphaNumeric(),
    password: vine.string().minLength(12).maxLength(100),
  }),
);
