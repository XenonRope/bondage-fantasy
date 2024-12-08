import { ZoneMap } from "../components/zone-map";
import { useAppStore } from "../store";
import {
  FieldConnectionKey,
  FieldKey,
  findFieldByPosition,
  getFieldConnectionKey,
  getFieldKey,
  getPositionFromFieldKey,
  Position,
} from "bondage-fantasy-common";
import { useMemo, useState } from "react";

export function ExplorePage() {
  const zone = useAppStore((state) => state.zone);
  const [selectedFieldKey, setSelectedFieldKey] = useState<FieldKey>();
  const [selectedConnectionKey, setSelectedConnectionKey] =
    useState<FieldConnectionKey>();
  const selectedField = useMemo(() => {
    if (!selectedFieldKey || !zone) {
      return undefined;
    }
    return findFieldByPosition(
      zone.fields,
      getPositionFromFieldKey(selectedFieldKey),
    );
  }, [selectedFieldKey, zone]);

  function onFieldClick(position: Position): void {
    const fieldKey = getFieldKey(position);
    setSelectedFieldKey(fieldKey);
    setSelectedConnectionKey(undefined);
  }

  function onConnectionClick(positions: [Position, Position]): void {
    const connectionKey = getFieldConnectionKey(positions);
    setSelectedFieldKey(undefined);
    setSelectedConnectionKey(connectionKey);
  }

  if (!zone) {
    return <></>;
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col h-full w-1/2 border-r border-app-shell p-md">
        <div className="min-h-[256px] max-w-fit overflow-auto mt-4">
          <ZoneMap
            fields={zone.fields}
            connections={zone.connections}
            selectedField={selectedFieldKey}
            selectedConnection={selectedConnectionKey}
            onFieldClick={onFieldClick}
            onConnectionClick={onConnectionClick}
          />
        </div>
      </div>
      <div className="w-1/2 p-md">
        <div>{zone.currentFieldDescription}</div>
        {selectedField && <div>{selectedField.name}</div>}
      </div>
    </div>
  );
}
