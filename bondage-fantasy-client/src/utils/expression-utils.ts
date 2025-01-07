import { parser } from "../grammar/expression-parser";
import * as terms from "../grammar/expression-parser.terms";
import { SyntaxNodeRef, Tree, TreeCursor } from "@lezer/common";
import {
  Expression,
  isEnum,
  Operation,
  Operator,
} from "bondage-fantasy-common";

export function parseExpression(source: string): Expression | null {
  const tree = parser.parse(source);
  if (hasError(tree)) {
    return null;
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

function traverse(source: string, cursor: TreeCursor): Expression | null {
  if (cursor.type.id === terms.String) {
    return (
      source
        // Skip quotation marks
        .substring(cursor.from + 1, cursor.to - 1)
        .replace(/\\"/g, '"')
    );
  }
  if (cursor.type.id === terms.Operation) {
    cursor.firstChild();
    const operator = source.substring(cursor.from, cursor.to);
    if (!isEnum(Operator, operator)) {
      return null;
    }
    // Skip Operator
    cursor.nextSibling();
    // Skip LeftParenthesis
    cursor.nextSibling();
    const argumentList: Expression[] = [];
    do {
      const argument = traverse(source, cursor.node.cursor());
      if (argument == null) {
        return null;
      }
      argumentList.push(argument);
    } while (
      cursor.nextSibling() &&
      (cursor.node.type.id === terms.String ||
        cursor.node.type.id === terms.Operation)
    );
    const operation: Operation = {
      operator,
      arguments: argumentList,
    };

    return operation;
  }

  return null;
}
