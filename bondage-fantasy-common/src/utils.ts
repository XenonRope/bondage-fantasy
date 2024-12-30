import {
  Field,
  FieldConnection,
  FieldConnectionKey,
  FieldKey,
  Position,
} from "./model.js";

export function arePositionsEqual(
  firstPosition?: Position,
  secondPosition?: Position
): boolean {
  if (!firstPosition && !secondPosition) {
    return true;
  }
  if (!firstPosition || !secondPosition) {
    return false;
  }

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

export function findFieldByPosition<T extends { position: Position }>(
  fields: T[],
  position: Position
): T | undefined {
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

export function getPositionsFromConnectionKey(
  connectionKey: FieldConnectionKey
): [Position, Position] {
  const [x1, y1, x2, y2] = connectionKey.split("-");
  return [
    { x: parseInt(x1), y: parseInt(y1) },
    { x: parseInt(x2), y: parseInt(y2) },
  ];
}

export function findConnectionByConnectionKey(
  connections: FieldConnection[],
  connectionKey: FieldConnectionKey
): FieldConnection | undefined {
  return connections.find(
    (connection) => getFieldConnectionKey(connection) === connectionKey
  );
}

export function doesConnectionKeyContainFieldKey(
  connectionKey: FieldConnectionKey,
  fieldKey: FieldKey
): boolean {
  return connectionKey.startsWith(fieldKey) || connectionKey.endsWith(fieldKey);
}

export function hasDuplicates(array: unknown[]): boolean {
  return new Set(array).size !== array.length;
}
