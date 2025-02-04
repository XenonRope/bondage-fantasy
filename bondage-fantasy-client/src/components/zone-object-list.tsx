import { useAppStore } from "../store";
import { faEllipsis, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Menu } from "@mantine/core";
import {
  CharacterZoneVisionObject,
  EventZoneVisionObject,
  ObjectType,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { ReactNode, useMemo } from "react";

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

function ObjectActions(props: {
  actions: { label: ReactNode; onClick: () => void }[];
}) {
  if (props.actions.length === 0) {
    return <></>;
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="transparent">
          <FontAwesomeIcon icon={faEllipsis} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {props.actions.map((action, index) => (
          <Menu.Item key={index} onClick={action.onClick}>
            {action.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

export function ZoneObjectList(props: {
  objects: ZoneVisionObject[];
  actions?: (
    object: ZoneVisionObject,
  ) => { label: ReactNode; onClick: () => void }[];
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
          <ObjectActions
            actions={props.actions?.(object) ?? []}
          ></ObjectActions>
        </div>
      ))}
    </div>
  );
}
