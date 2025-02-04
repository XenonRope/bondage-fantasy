import { SyntaxNodeRef, Tree, TreeCursor } from "@lezer/common";
import { expressionParser, expressionParserTerms } from "./grammar/index.js";
import { Expression, Operation, Operator } from "./model.js";
import { isEnum } from "./utils.js";

export enum ExpressionParserErrorType {
  INVALID_SYNTAX = "INVALID_SYNTAX",
  INVALID_OPERATOR = "INVALID_OPERATOR",
  INVALID_NUMBER_OF_ARGUMENTS = "INVALID_NUMBER_OF_ARGUMENTS",
}

export interface InvalidSyntax {
  type: ExpressionParserErrorType.INVALID_SYNTAX;
}

export interface InvalidOperator {
  type: ExpressionParserErrorType.INVALID_OPERATOR;
  operator: string;
}

export interface InvalidNumberOfArguments {
  type: ExpressionParserErrorType.INVALID_NUMBER_OF_ARGUMENTS;
  operator: string;
  expected: number;
  actual: number;
}

export type ExpressionParserError =
  | InvalidSyntax
  | InvalidOperator
  | InvalidNumberOfArguments;

export function parseExpression(
  source: string,
): [Expression, null] | [null, ExpressionParserError] {
  const tree = expressionParser.parse(source);
  if (hasError(tree)) {
    return [null, { type: ExpressionParserErrorType.INVALID_SYNTAX }];
  }

  const cursor = tree.cursor();
  cursor.firstChild();

  return traverse(source, cursor);
}

function hasError(tree: Tree): boolean {
  let error = false;
  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      if (node.type.isError) {
        {
          error = true;
          return false;
        }
      }
    },
  });

  return error;
}

function traverse(
  source: string,
  cursor: TreeCursor,
): [Expression, null] | [null, ExpressionParserError] {
  if (cursor.type.id === expressionParserTerms.String) {
    if (source.length < 2 || source[cursor.to - 1] !== '"') {
      return [null, { type: ExpressionParserErrorType.INVALID_SYNTAX }];
    }
    const stringExpression = source
      // Skip quotation marks
      .substring(cursor.from + 1, cursor.to - 1)
      .replace(/\\"/g, '"');
    return [stringExpression, null];
  } else {
    cursor.firstChild();
    const operator = source.substring(cursor.from, cursor.to);
    if (!isEnum(Operator, operator)) {
      return [
        null,
        { type: ExpressionParserErrorType.INVALID_OPERATOR, operator },
      ];
    }
    // Skip Operator
    cursor.nextSibling();
    // Skip LeftParenthesis
    cursor.nextSibling();
    const argumentList: Expression[] = [];
    do {
      const [argument, error] = traverse(source, cursor.node.cursor());
      if (error) {
        return [null, error];
      }
      argumentList.push(argument);
    } while (
      cursor.nextSibling() &&
      (cursor.node.type.id === expressionParserTerms.String ||
        cursor.node.type.id === expressionParserTerms.Operation)
    );

    const expectedArgumentCount = getExpectedArgumentCount(operator);
    if (expectedArgumentCount !== argumentList.length) {
      return [
        null,
        {
          type: ExpressionParserErrorType.INVALID_NUMBER_OF_ARGUMENTS,
          operator,
          expected: expectedArgumentCount,
          actual: argumentList.length,
        },
      ];
    }

    const operation: Operation = {
      operator,
      arguments: argumentList,
    };

    return [operation, null];
  }
}

function getExpectedArgumentCount(operator: Operator): number {
  switch (operator) {
    case Operator.NOT:
    case Operator.VARIABLE:
    case Operator.INTERPOLATE:
      return 1;
    case Operator.EQUAL:
    case Operator.NOT_EQUAL:
    case Operator.GREATER_THAN:
    case Operator.GREATER_THAN_OR_EQUAL:
    case Operator.LESS_THAN:
    case Operator.LESS_THAN_OR_EQUAL:
    case Operator.AND:
    case Operator.OR:
    case Operator.XOR:
    case Operator.ADD:
    case Operator.SUBTRACT:
    case Operator.MULTIPLY:
    case Operator.DIVIDE:
    case Operator.MODULO:
    case Operator.CONCATENATE:
      return 2;
    case Operator.IF_ELSE:
      return 3;
  }
}
