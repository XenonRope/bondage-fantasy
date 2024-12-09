import { useAppStore } from "../store";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CharacterZoneVisionObject,
  isCharacterObject,
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
      if (isCharacterObject(object) && object.characterId === characterId) {
        return 100;
      }
      return 0;
    }

    const objects = [...props.objects];
    objects.sort((first, second) => getPriority(second) - getPriority(first));
    return objects;
  }, [props.objects, characterId]);

  return (
    <div>
      {sortedObjects.map((object) => (
        <div key={object.id}>
          {isCharacterObject(object) && <CharacterItem object={object} />}
        </div>
      ))}
    </div>
  );
}
