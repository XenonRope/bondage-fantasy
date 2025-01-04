import { useAppStore } from "../store";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CharacterZoneVisionObject,
  ObjectType,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { useMemo } from "react";

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

export function ZoneObjectList(props: { objects: ZoneVisionObject[] }) {
  const characterId = useAppStore((state) => state.character?.id);
  const sortedObjects = useMemo(() => {
    function getPriority(object: ZoneVisionObject): number {
      switch (object.type) {
        case ObjectType.CHARACTER:
          return object.characterId === characterId ? 100 : 50;
        case ObjectType.NPC:
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
        <div key={index}>
          {object.type === ObjectType.CHARACTER && (
            <CharacterItem object={object} />
          )}
        </div>
      ))}
    </div>
  );
}
