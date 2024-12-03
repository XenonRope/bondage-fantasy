import {
  Field,
  Position,
  FieldKey,
  FieldConnectionKey,
  FieldConnection,
} from "./model.js";

export function arePositionsEqual(
  firstPosition: Position,
  secondPosition: Position
): boolean {
  return (
    firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y
  );
}

function comparePositions(
  { x: x1, y: y1 }: Position,
  { x: x2, y: y2 }: Position
): number {
  if (y1 < y2) return -1;
  if (y1 > y2) return 1;
  if (x1 < x2) return -1;
  if (x1 > x2) return 1;
  return 0;
}

export function findFieldByPosition(
  fields: Field[],
  position: Position
): Field | undefined {
  return fields.find((field) => arePositionsEqual(field.position, position));
}

export function getFieldKey(fieldOrPosition: Field | Position): FieldKey {
  return "position" in fieldOrPosition
    ? getFieldKey(fieldOrPosition.position)
    : `${fieldOrPosition.x}-${fieldOrPosition.y}`;
}

export function getPositionFromFieldKey(fieldKey: undefined): undefined;
export function getPositionFromFieldKey(fieldKey: FieldKey): Position;
export function getPositionFromFieldKey(
  fieldKey: FieldKey | undefined
): Position | undefined;
export function getPositionFromFieldKey(
  fieldKey: FieldKey | undefined
): Position | undefined {
  if (!fieldKey) {
    return undefined;
  }

  const [x, y] = fieldKey.split("-");
  return {
    x: parseInt(x),
    y: parseInt(y),
  };
}

export function getFieldConnectionKey(
  connectionOrPositions: FieldConnection | [Position, Position]
): FieldConnectionKey {
  if ("positions" in connectionOrPositions) {
    return getFieldConnectionKey(connectionOrPositions.positions);
  }

  const [pos1, pos2] = connectionOrPositions;
  if (comparePositions(pos1, pos2) < 0) {
    return `${pos1.x}-${pos1.y}-${pos2.x}-${pos2.y}`;
  } else {
    return `${pos2.x}-${pos2.y}-${pos1.x}-${pos1.y}`;
  }
}
