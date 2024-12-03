import {
  arePositionsEqual,
  Field,
  Position,
  ZONE_MAX_HEIGHT,
  ZONE_MAX_WIDTH,
} from "bondage-fantasy-common";
import { useMemo } from "react";

const FIELD_SIZE = 64;

export function ZoneMap(props: {
  fields: Field[];
  entrance?: Position;
  selectedField?: Position;
  onFieldClick?: (position: Position) => void;
}) {
  const fields = useMemo(() => {
    const fields: Field[][] = [...Array(ZONE_MAX_HEIGHT)].map(() =>
      Array(ZONE_MAX_WIDTH),
    );
    props.fields.forEach((field) => {
      fields[field.position.y][field.position.x] = field;
    });
    return fields;
  }, [props.fields]);

  function getFieldClasses(x: number, y: number): string {
    const field = fields[y][x];
    if (field) {
      let result: string;
      if (arePositionsEqual({ x, y }, props.entrance)) {
        result = "bg-green-500";
      } else {
        result = "bg-green-300";
      }
      if (arePositionsEqual({ x, y }, props.selectedField)) {
        result += " border-4 border-yellow-400";
      }

      return result;
    } else {
      return "bg-gray-100 hover:bg-gray-200";
    }
  }

  return (
    <div className="flex flex-col w-fit" style={{ gap: `${FIELD_SIZE / 2}px` }}>
      {[...Array(ZONE_MAX_HEIGHT).keys()].map((y) => (
        <div
          key={y}
          className="flex flex-row"
          style={{ gap: `${FIELD_SIZE / 2}px` }}
        >
          {[...Array(ZONE_MAX_WIDTH).keys()].map((x) => (
            <div
              key={x}
              onClick={() => props.onFieldClick?.({ x, y })}
              className={getFieldClasses(x, y)}
              style={{ width: `${FIELD_SIZE}px`, height: `${FIELD_SIZE}px` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
