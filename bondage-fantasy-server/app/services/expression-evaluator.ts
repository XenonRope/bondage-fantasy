import { inject } from "@adonisjs/core";
import { Expression, Operator } from "bondage-fantasy-common";

const TRUE = "TRUE";
const FALSE = "FALSE";

@inject()
export class ExpressionEvaluator {
  evaluateAsBoolean(expression: Expression): boolean {
    return this.evaluate(expression) === TRUE;
  }

  evaluateAsNumber(expression: Expression): number {
    return parseFloat(this.evaluate(expression));
  }

  evaluate(expression: Expression): string {
    if (typeof expression === "string") {
      return expression;
    }

    switch (expression.operator) {
      case Operator.EQUAL:
        return this.evaluate(expression.arguments[0]) ===
          this.evaluate(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.NOT_EQUAL:
        return this.evaluate(expression.arguments[0]) !==
          this.evaluate(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.GREATER_THAN:
        return this.evaluateAsNumber(expression.arguments[0]) >
          this.evaluateAsNumber(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.GREATER_THAN_OR_EQUAL:
        return this.evaluateAsNumber(expression.arguments[0]) >=
          this.evaluateAsNumber(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.LESS_THAN:
        return this.evaluateAsNumber(expression.arguments[0]) <
          this.evaluateAsNumber(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.LESS_THAN_OR_EQUAL:
        return this.evaluateAsNumber(expression.arguments[0]) <=
          this.evaluateAsNumber(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.NOT:
        return !this.evaluateAsBoolean(expression.arguments[0]) ? TRUE : FALSE;
      case Operator.AND:
        return this.evaluateAsBoolean(expression.arguments[0]) &&
          this.evaluateAsBoolean(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.OR:
        return this.evaluateAsBoolean(expression.arguments[0]) ||
          this.evaluateAsBoolean(expression.arguments[1])
          ? TRUE
          : FALSE;
      case Operator.XOR:
        return (this.evaluateAsBoolean(expression.arguments[0]) ? 1 : 0) ^
          (this.evaluateAsBoolean(expression.arguments[1]) ? 1 : 0)
          ? TRUE
          : FALSE;
      case Operator.ADD:
        return (
          this.evaluateAsNumber(expression.arguments[0]) +
          this.evaluateAsNumber(expression.arguments[1])
        ).toString();
      case Operator.SUBTRACT:
        return (
          this.evaluateAsNumber(expression.arguments[0]) -
          this.evaluateAsNumber(expression.arguments[1])
        ).toString();
      case Operator.MULTIPLY:
        return (
          this.evaluateAsNumber(expression.arguments[0]) *
          this.evaluateAsNumber(expression.arguments[1])
        ).toString();
      case Operator.DIVIDE:
        return (
          this.evaluateAsNumber(expression.arguments[0]) /
          this.evaluateAsNumber(expression.arguments[1])
        ).toString();
      case Operator.MODULO:
        return (
          this.evaluateAsNumber(expression.arguments[0]) %
          this.evaluateAsNumber(expression.arguments[1])
        ).toString();
      case Operator.CONCATENATE:
        return (
          this.evaluate(expression.arguments[0]) +
          this.evaluate(expression.arguments[1])
        );
      case Operator.VARIABLE:
        throw new Error("Not implemented");
      case Operator.INTERPOLATE:
        throw new Error("Not implemented");
      case Operator.IF_ELSE:
        return this.evaluateAsBoolean(expression.arguments[0])
          ? this.evaluate(expression.arguments[1])
          : this.evaluate(expression.arguments[2]);
    }
  }
}
