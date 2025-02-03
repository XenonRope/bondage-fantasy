import { inject } from "@adonisjs/core";
import { Expression, FALSE, Operator, TRUE } from "bondage-fantasy-common";
import { TemplateRenderer } from "./template-renderer.js";

@inject()
export class ExpressionEvaluator {
  constructor(private templateRenderer: TemplateRenderer) {}

  evaluateAsBoolean(
    expression: Expression,
    variables: Record<string, string>,
  ): boolean {
    return this.evaluate(expression, variables) === TRUE;
  }

  evaluateAsInteger(
    expression: Expression,
    variables: Record<string, string>,
  ): number {
    return parseInt(this.evaluate(expression, variables));
  }

  evaluateAsNumber(
    expression: Expression,
    variables: Record<string, string>,
  ): number {
    return parseFloat(this.evaluate(expression, variables));
  }

  evaluate(expression: Expression, variables: Record<string, string>): string {
    if (typeof expression === "string") {
      return expression;
    }

    switch (expression.operator) {
      case Operator.EQUAL:
        return this.evaluate(expression.arguments[0], variables) ===
          this.evaluate(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.NOT_EQUAL:
        return this.evaluate(expression.arguments[0], variables) !==
          this.evaluate(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.GREATER_THAN:
        return this.evaluateAsNumber(expression.arguments[0], variables) >
          this.evaluateAsNumber(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.GREATER_THAN_OR_EQUAL:
        return this.evaluateAsNumber(expression.arguments[0], variables) >=
          this.evaluateAsNumber(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.LESS_THAN:
        return this.evaluateAsNumber(expression.arguments[0], variables) <
          this.evaluateAsNumber(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.LESS_THAN_OR_EQUAL:
        return this.evaluateAsNumber(expression.arguments[0], variables) <=
          this.evaluateAsNumber(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.NOT:
        return !this.evaluateAsBoolean(expression.arguments[0], variables)
          ? TRUE
          : FALSE;
      case Operator.AND:
        return this.evaluateAsBoolean(expression.arguments[0], variables) &&
          this.evaluateAsBoolean(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.OR:
        return this.evaluateAsBoolean(expression.arguments[0], variables) ||
          this.evaluateAsBoolean(expression.arguments[1], variables)
          ? TRUE
          : FALSE;
      case Operator.XOR:
        return (this.evaluateAsBoolean(expression.arguments[0], variables)
          ? 1
          : 0) ^
          (this.evaluateAsBoolean(expression.arguments[1], variables) ? 1 : 0)
          ? TRUE
          : FALSE;
      case Operator.ADD:
        return (
          this.evaluateAsNumber(expression.arguments[0], variables) +
          this.evaluateAsNumber(expression.arguments[1], variables)
        ).toString();
      case Operator.SUBTRACT:
        return (
          this.evaluateAsNumber(expression.arguments[0], variables) -
          this.evaluateAsNumber(expression.arguments[1], variables)
        ).toString();
      case Operator.MULTIPLY:
        return (
          this.evaluateAsNumber(expression.arguments[0], variables) *
          this.evaluateAsNumber(expression.arguments[1], variables)
        ).toString();
      case Operator.DIVIDE:
        return (
          this.evaluateAsNumber(expression.arguments[0], variables) /
          this.evaluateAsNumber(expression.arguments[1], variables)
        ).toString();
      case Operator.MODULO:
        return (
          this.evaluateAsNumber(expression.arguments[0], variables) %
          this.evaluateAsNumber(expression.arguments[1], variables)
        ).toString();
      case Operator.CONCATENATE:
        return (
          this.evaluate(expression.arguments[0], variables) +
          this.evaluate(expression.arguments[1], variables)
        );
      case Operator.VARIABLE:
        return (
          variables[this.evaluate(expression.arguments[0], variables)] ?? ""
        );
      case Operator.INTERPOLATE:
        return this.templateRenderer.render(
          this.evaluate(expression.arguments[0], variables),
          variables,
        );
      case Operator.IF_ELSE:
        return this.evaluateAsBoolean(expression.arguments[0], variables)
          ? this.evaluate(expression.arguments[1], variables)
          : this.evaluate(expression.arguments[2], variables);
    }
  }
}
