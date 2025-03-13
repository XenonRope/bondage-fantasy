import {
  faFlag,
  faFlagCheckered,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Center } from "@mantine/core";
import {
  arePositionsEqual,
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
const CONNECTION_WIDTH = 12;
const FLAG_SIZE = (FIELD_SIZE - 8) / 2;

interface MapField {
  position: Position;
  canLeave: boolean;
}

interface MapConnection {
  positions: [Position, Position];
}

interface MapFieldExtended extends MapField {
  rightConnection?: MapConnection;
  rightConnectionPossible?: boolean;
  bottomConnection?: MapConnection;
  bottomConnectionPossible?: boolean;
}

export function ZoneMap(props: {
  fields: MapField[];
  connections: MapConnection[];
  entrance?: Position;
  playerPosition?: Position;
  selectedField?: FieldKey;
  selectedConnection?: FieldConnectionKey;
  editMode?: boolean;
  onFieldClick?: (position: Position) => void;
  onConnectionClick?: (positions: [Position, Position]) => void;
}) {
  const fields = useMemo(() => {
    const fields: MapFieldExtended[][] = [...Array(ZONE_MAX_HEIGHT)].map(() =>
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
      let result = "bg-linear-to-br from-green-200 to-green-400";
      if (
        props.selectedField &&
        props.selectedField === getFieldKey({ x, y })
      ) {
        result += " border-4 border-blue-600";
      } else {
        result += " border-4 border-double border-black";
      }

      return result;
    } else if (props.editMode) {
      return "bg-gray-100 hover:bg-gray-200";
    } else {
      return "opacity-0";
    }
  }

  function getConnectionClasses(connection?: FieldConnection): string {
    if (connection) {
      let result = "absolute bg-linear-to-br from-gray-200 to-gray-300";
      if (
        props.selectedConnection &&
        props.selectedConnection === getFieldConnectionKey(connection)
      ) {
        result += " border-4 border-blue-600";
      } else {
        result += " border-black";
        if (connection.positions[0].y === connection.positions[1].y) {
          result += " border-t-2 border-b-2";
        } else {
          result += " border-l-2 border-r-2";
        }
      }
      return result;
    } else if (props.editMode) {
      return "absolute bg-gray-100 hover:bg-gray-200";
    } else {
      return "absolute hidden";
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
                onClick={() =>
                  (fields[y][x] || props.editMode) &&
                  props.onFieldClick?.({ x, y })
                }
                className={getFieldClasses(x, y)}
                style={{ width: `${FIELD_SIZE}px`, height: `${FIELD_SIZE}px` }}
              >
                <div className="flex flex-wrap">
                  {props.playerPosition &&
                    arePositionsEqual({ x, y }, props.playerPosition) && (
                      <Center
                        w={FLAG_SIZE}
                        h={FLAG_SIZE}
                        className="text-indigo-700"
                      >
                        <FontAwesomeIcon icon={faUser} />
                      </Center>
                    )}
                  {props.entrance &&
                    arePositionsEqual({ x, y }, props.entrance) && (
                      <Center
                        w={FLAG_SIZE}
                        h={FLAG_SIZE}
                        className="text-green-700"
                      >
                        <FontAwesomeIcon icon={faFlag} />
                      </Center>
                    )}
                  {fields[y][x]?.canLeave && (
                    <Center
                      w={FLAG_SIZE}
                      h={FLAG_SIZE}
                      className="text-red-700"
                    >
                      <FontAwesomeIcon icon={faFlagCheckered} />
                    </Center>
                  )}
                </div>
              </div>
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
                    height: `${CONNECTION_WIDTH}px`,
                    top: `${FIELD_SIZE / 2 - CONNECTION_WIDTH / 2}px`,
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
                    width: `${CONNECTION_WIDTH}px`,
                    height: `${FIELD_SIZE / 2}px`,
                    left: `${FIELD_SIZE / 2 - CONNECTION_WIDTH / 2}px`,
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
