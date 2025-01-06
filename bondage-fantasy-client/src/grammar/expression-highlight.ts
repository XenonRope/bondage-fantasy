import { styleTags, tags } from "@lezer/highlight";

export const highlighting = styleTags({
  "LeftParenthesis RightParenthesis": tags.strong,
  Operator: tags.tagName,
  String: tags.string,
});
