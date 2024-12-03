import { Field, Position } from "./model.js";

export function arePositionsEqual(
  firstPosition: Position,
  secondPosition: Position
): boolean {
  return (
    firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y
  );
}

export function findFieldByPosition(
  fields: Field[],
  position: Position
): Field | undefined {
  return fields.find((field) => arePositionsEqual(field.position, position));
}
