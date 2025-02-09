import {
  Character,
  ItemSlot,
  WearableItemOnCharacter,
} from "bondage-fantasy-common";
import { Translation } from "react-i18next";
import { ImageWithPlaceholder } from "./image-with-placeholder";

function CharacterWearableSlot(props: {
  slot: ItemSlot;
  wearable?: WearableItemOnCharacter;
}) {
  return (
    <div className="flex gap-2">
      <div className="h-11 w-11 flex-shrink-0">
        {props.wearable && (
          <ImageWithPlaceholder image={props.wearable.imageKey} />
        )}
        {!props.wearable && <div className="h-full border border-gray-300" />}
      </div>
      <div className="overflow-hidden">
        <div className="text-sm font-medium">
          <Translation>{(t) => t(`item.slots.${props.slot}`)}</Translation>
        </div>
        <div className="text-sm truncate">{props.wearable?.name}</div>
      </div>
    </div>
  );
}

export function CharacterWearables(props: { character: Character }) {
  return (
    <div className="flex flex-col gap-1">
      {Object.values(ItemSlot).map((slot) => (
        <CharacterWearableSlot
          key={slot}
          slot={slot}
          wearable={props.character.wearables.find((wearable) =>
            wearable.slots.includes(slot),
          )}
        />
      ))}
    </div>
  );
}
