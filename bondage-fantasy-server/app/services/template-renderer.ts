import { inject } from "@adonisjs/core";
import { Character, getVariables, Template } from "bondage-fantasy-common";
import mustache from "mustache";

@inject()
export class TemplateRenderer {
  render(template: Template, params: { character: Character }): string {
    try {
      return mustache.render(
        template,
        getVariables({
          character: params.character,
        }),
      );
    } catch {
      return "<ERROR>";
    }
  }
}
