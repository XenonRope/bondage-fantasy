import {
  Field,
  Position,
  ZONE_MAX_HEIGHT,
  ZONE_MAX_WIDTH,
} from "bondage-fantasy-common";
import { useMemo } from "react";

export function ZoneMap(props: {
  fields: Field[];
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

  return (
    <div className="flex flex-col gap-[32px] w-fit">
      {[...Array(ZONE_MAX_HEIGHT).keys()].map((y) => (
        <div key={y} className="flex flex-row gap-[32px]">
          {[...Array(ZONE_MAX_WIDTH).keys()].map((x) =>
            fields[y][x] ? (
              <div
                key={x}
                onClick={() => props.onFieldClick?.({ x, y })}
                className="w-[64px] h-[64px] bg-green-300"
              ></div>
            ) : (
              <div
                key={x}
                onClick={() => props.onFieldClick?.({ x, y })}
                className="w-[64px] h-[64px] bg-gray-100 hover:bg-gray-200"
              ></div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}
