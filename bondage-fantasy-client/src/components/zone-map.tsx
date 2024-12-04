import {
  arePositionsEqual,
  Field,
  FieldConnection,
  FieldConnectionKey,
  FieldKey,
  getFieldConnectionKey,
  getFieldKey,
  Position,
  ZONE_MAX_HEIGHT,
  ZONE_MAX_WIDTH,
} from "bondage-fantasy-common";
import { useMemo } from "react";

const FIELD_SIZE = 64;

interface MapField extends Field {
  rightConnection?: FieldConnection;
  rightConnectionPossible?: boolean;
  bottomConnection?: FieldConnection;
  bottomConnectionPossible?: boolean;
}

export function ZoneMap(props: {
  fields: Field[];
  connections: FieldConnection[];
  entrance?: Position;
  selectedField?: FieldKey;
  selectedConnection?: FieldConnectionKey;
  onFieldClick?: (position: Position) => void;
  onConnectionClick?: (positions: [Position, Position]) => void;
}) {
  const fields = useMemo(() => {
    const fields: MapField[][] = [...Array(ZONE_MAX_HEIGHT)].map(() =>
      Array(ZONE_MAX_WIDTH),
    );
    props.fields.forEach((field) => {
      fields[field.position.y][field.position.x] = { ...field };
    });
    props.fields.forEach((field) => {
      if (
        field.position.x < ZONE_MAX_WIDTH - 1 &&
        fields[field.position.y][field.position.x + 1]
      ) {
        fields[field.position.y][field.position.x].rightConnectionPossible =
          true;
      }
      if (
        field.position.y < ZONE_MAX_HEIGHT - 1 &&
        fields[field.position.y + 1][field.position.x]
      ) {
        fields[field.position.y][field.position.x].bottomConnectionPossible =
          true;
      }
    });
    props.connections.forEach((connection) => {
      const [pos1, pos2] = connection.positions;
      if (pos1.x === pos2.x) {
        if (pos1.y < pos2.y) {
          fields[pos1.y][pos1.x].bottomConnection = connection;
        } else {
          fields[pos2.y][pos2.x].bottomConnection = connection;
        }
      } else {
        if (pos1.x < pos2.x) {
          fields[pos1.y][pos1.x].rightConnection = connection;
        } else {
          fields[pos2.y][pos2.x].rightConnection = connection;
        }
      }
    });
    return fields;
  }, [props.fields, props.connections]);

  function getFieldClasses(x: number, y: number): string {
    const field = fields[y][x];
    if (field) {
      let result: string;
      if (arePositionsEqual({ x, y }, props.entrance)) {
        result = "bg-green-500";
      } else {
        result = "bg-green-300";
      }
      if (
        props.selectedField &&
        props.selectedField === getFieldKey({ x, y })
      ) {
        result += " border-4 border-yellow-400";
      }

      return result;
    } else {
      return "bg-gray-100 hover:bg-gray-200";
    }
  }

  function getConnectionClasses(connection?: FieldConnection): string {
    if (connection) {
      let result = "absolute bg-green-300";
      if (
        props.selectedConnection &&
        props.selectedConnection === getFieldConnectionKey(connection)
      ) {
        result += " border-4 border-yellow-400";
      }
      return result;
    } else {
      return "absolute bg-gray-100 hover:bg-gray-200";
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
            <div key={x} className="relative">
              <div
                onClick={() => props.onFieldClick?.({ x, y })}
                className={getFieldClasses(x, y)}
                style={{ width: `${FIELD_SIZE}px`, height: `${FIELD_SIZE}px` }}
              ></div>
              {fields[y][x]?.rightConnectionPossible && (
                <div
                  className={getConnectionClasses(fields[y][x].rightConnection)}
                  onClick={() =>
                    props.onConnectionClick?.([
                      { x, y },
                      { x: x + 1, y },
                    ])
                  }
                  style={{
                    width: `${FIELD_SIZE / 2}px`,
                    height: `${FIELD_SIZE / 4}px`,
                    top: `${FIELD_SIZE / 2 - FIELD_SIZE / 8}px`,
                    left: `${FIELD_SIZE}px`,
                  }}
                />
              )}
              {fields[y][x]?.bottomConnectionPossible && (
                <div
                  className={getConnectionClasses(
                    fields[y][x].bottomConnection,
                  )}
                  onClick={() =>
                    props.onConnectionClick?.([
                      { x, y },
                      { x, y: y + 1 },
                    ])
                  }
                  style={{
                    width: `${FIELD_SIZE / 4}px`,
                    height: `${FIELD_SIZE / 2}px`,
                    left: `${FIELD_SIZE / 2 - FIELD_SIZE / 8}px`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
