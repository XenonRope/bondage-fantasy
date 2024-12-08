import { zoneApi } from "../api/zone-api";
import { ZoneMap } from "../components/zone-map";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { Button } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
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
import { Trans } from "react-i18next";
import { useNavigate } from "react-router";

export function ExplorePage() {
  const navigate = useNavigate();
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
  const leave = useMutation({
    mutationFn: async () => {
      const sessionData = await zoneApi.leave();
      useAppStore.getState().updateSessionData(sessionData);
      navigate("/zones");
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

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
        {selectedField && (
          <>
            <div>{selectedField.name}</div>
            <div>
              <Button
                disabled={!selectedField.canLeave}
                onClick={() => !leave.isPending && leave.mutate()}
              >
                <Trans i18nKey="explore.leave" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
