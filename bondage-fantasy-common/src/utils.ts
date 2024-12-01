import { ZoneField, ZoneFieldPosition } from "./model.js";

export function arePositionsEqual(
  firstPosition: ZoneFieldPosition,
  secondPosition: ZoneFieldPosition
): boolean {
  return (
    firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y
  );
}

export function findFieldByPosition(
  fields: ZoneField[],
  position: ZoneFieldPosition
): ZoneField | undefined {
  return fields.find((field) => arePositionsEqual(field.position, position));
}
