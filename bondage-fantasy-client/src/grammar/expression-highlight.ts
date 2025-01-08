import { styleTags, tags } from "@lezer/highlight";

export const expressionHighlighting = styleTags({
  "LeftParenthesis RightParenthesis": tags.strong,
  Operator: tags.tagName,
  String: tags.string,
});
