import { inject } from "@adonisjs/core";
import { Template } from "bondage-fantasy-common";
import mustache from "mustache";

@inject()
export class TemplateRenderer {
  render(template: Template, variables: Record<string, string>): string {
    try {
      return mustache.render(template, variables);
    } catch {
      return "<ERROR>";
    }
  }
}
