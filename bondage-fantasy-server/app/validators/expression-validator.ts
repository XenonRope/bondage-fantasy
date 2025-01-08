import vine from "@vinejs/vine";
import { FieldContext } from "@vinejs/vine/types";
import {
  EXPRESSION_SOURCE_MAX_LENGTH,
  parseExpression,
} from "bondage-fantasy-common";

const validateExpression = vine.createRule(
  async (value: unknown, _options: unknown, field: FieldContext) => {
    if (typeof value !== "string") {
      return;
    }

    const [, error] = parseExpression(value);
    if (error) {
      field.report(`Invalid expression: ${error}`, "validateExpression", field);
    }
  },
);

export const expressionSource = vine
  .string()
  .maxLength(EXPRESSION_SOURCE_MAX_LENGTH)
  .bail(true)
  .use(validateExpression());
