import { zoneApi } from "../api/zone-api";
import { ZoneMap } from "../components/zone-map";
import { ZoneObjectList } from "../components/zone-object-list";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { Button } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import {
  FieldConnectionKey,
  FieldKey,
  findConnectionByConnectionKey,
  findFieldByPosition,
  getFieldConnectionKey,
  getFieldKey,
  getPositionFromFieldKey,
  ObjectType,
  Position,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { SceneViewer } from "../components/scene-viewer";

export function ExplorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const zone = useAppStore((state) => state.zone);
  const scene = useAppStore((state) => state.scene);
  const currentField = useMemo(() => {
    if (!zone) {
      return;
    }
    return findFieldByPosition(zone.fields, zone.currentPosition);
  }, [zone]);
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
  const isSelectedFieldConnectedToCurrentPosition = useMemo(() => {
    if (!selectedField || !zone) {
      return false;
    }
    return findConnectionByConnectionKey(
      zone.connections,
      getFieldConnectionKey([zone.currentPosition, selectedField.position]),
    );
  }, [selectedField, zone]);
  const leave = useMutation({
    mutationFn: async () => {
      const sessionData = await zoneApi.leave();
      useAppStore.getState().updateSessionData(sessionData);
      navigate("/zones");
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });
  const move = useMutation({
    mutationFn: async (destination: Position) => {
      const sessionData = await zoneApi.move({ destination });
      useAppStore.getState().updateSessionData(sessionData);
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });
  const interact = useMutation({
    mutationFn: async (eventId: number) => {
      const sessionData = await zoneApi.interactWithEvent({ eventId });
      useAppStore.getState().updateSessionData(sessionData);
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  function onFieldClick(position: Position): void {
    const fieldKey = getFieldKey(position);
    if (fieldKey === selectedFieldKey) {
      setSelectedFieldKey(undefined);
      return;
    }
    setSelectedFieldKey(fieldKey);
    setSelectedConnectionKey(undefined);
  }

  function onConnectionClick(positions: [Position, Position]): void {
    const connectionKey = getFieldConnectionKey(positions);
    if (connectionKey === selectedConnectionKey) {
      setSelectedConnectionKey(undefined);
      return;
    }
    setSelectedFieldKey(undefined);
    setSelectedConnectionKey(connectionKey);
  }

  function getObjectActions(
    visionObject: ZoneVisionObject,
  ): { label: ReactNode; onClick: () => void }[] {
    if (visionObject.type === ObjectType.EVENT && visionObject.canInteract) {
      return [
        {
          label: t("explore.interact"),
          onClick: () =>
            !interact.isPending && interact.mutate(visionObject.eventId),
        },
      ];
    }
    return [];
  }

  if (scene) {
    return <SceneViewer scene={scene} />;
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
            entrance={zone.entrance}
            playerPosition={zone.currentPosition}
            selectedField={selectedFieldKey}
            selectedConnection={selectedConnectionKey}
            onFieldClick={onFieldClick}
            onConnectionClick={onConnectionClick}
          />
        </div>
      </div>
      <div className="w-1/2">
        <div className="min-h-40 border-b border-app-shell p-md">
          <div className="font-medium">{currentField?.name}</div>
          <div>{zone.currentFieldDescription}</div>
          <div className="mt-4">
            <ZoneObjectList
              objects={currentField?.objects || []}
              actions={getObjectActions}
            />
          </div>
          <div className="mt-4">
            {currentField?.canLeave && (
              <Button onClick={() => !leave.isPending && leave.mutate()}>
                {t("explore.leave")}
              </Button>
            )}
          </div>
        </div>
        {selectedField && (
          <div className="p-md">
            <div className="font-medium">{selectedField?.name}</div>
            <div className="mt-4">
              {isSelectedFieldConnectedToCurrentPosition && (
                <Button
                  onClick={() =>
                    !move.isPending && move.mutate(selectedField.position)
                  }
                >
                  {t("explore.move")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
