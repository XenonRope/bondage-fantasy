import {
  faStar,
  faUser,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Tooltip } from "@mantine/core";
import {
  CharacterZoneVisionObject,
  EventZoneVisionObject,
  ObjectType,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { ReactNode, useMemo } from "react";
import { useAppStore } from "../store";
import {
  DEFAULT_TOOLTIP_DELAY,
  DEFAULT_TOOLTIP_TRANSITION_DURATION,
} from "../utils/utils";

function CharacterItem(props: { object: CharacterZoneVisionObject }) {
  const characterId = useAppStore((state) => state.character?.id);

  return (
    <div>
      <FontAwesomeIcon
        icon={faUser}
        className={
          props.object.characterId === characterId
            ? "text-indigo-700"
            : "text-yellow-700"
        }
      />
      <span className="ml-2">{props.object.name}</span>
    </div>
  );
}

function EventItem(props: { object: EventZoneVisionObject }) {
  return (
    <div>
      <FontAwesomeIcon icon={faStar} className={"text-green-700"} />
      <span className="ml-2">{props.object.name}</span>
    </div>
  );
}

export type ZoneObjectAction = {
  name: ReactNode;
  icon: IconDefinition;
  iconColor?: string;
  onClick: () => void;
};

function ObjectActions(props: { actions: ZoneObjectAction[] }) {
  if (props.actions.length === 0) {
    return <></>;
  }

  return (
    <div className="flex gap-2">
      {props.actions.map((action, index) => (
        <Tooltip
          label={action.name}
          openDelay={DEFAULT_TOOLTIP_DELAY}
          transitionProps={{ duration: DEFAULT_TOOLTIP_TRANSITION_DURATION }}
        >
          <ActionIcon
            key={index}
            variant="transparent"
            onClick={action.onClick}
            data-variant-color={action.iconColor}
          >
            <FontAwesomeIcon icon={action.icon} />
          </ActionIcon>
        </Tooltip>
      ))}
    </div>
  );
}

export function ZoneObjectList(props: {
  objects: ZoneVisionObject[];
  actions?: (object: ZoneVisionObject) => ZoneObjectAction[];
}) {
  const characterId = useAppStore((state) => state.character?.id);
  const sortedObjects = useMemo(() => {
    function getPriority(object: ZoneVisionObject): number {
      switch (object.type) {
        case ObjectType.CHARACTER:
          return object.characterId === characterId ? 100 : 50;
        case ObjectType.EVENT:
          return 0;
      }
    }

    const objects = [...props.objects];
    objects.sort((first, second) => getPriority(second) - getPriority(first));
    return objects;
  }, [props.objects, characterId]);

  return (
    <div>
      {sortedObjects.map((object, index) => (
        <div key={index} className="flex justify-between hover:bg-gray-100">
          {object.type === ObjectType.CHARACTER && (
            <CharacterItem object={object} />
          )}
          {object.type === ObjectType.EVENT && <EventItem object={object} />}
          <ObjectActions actions={props.actions?.(object) ?? []} />
        </div>
      ))}
    </div>
  );
}
