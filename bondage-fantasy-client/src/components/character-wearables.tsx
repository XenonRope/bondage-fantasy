import {
  Character,
  ItemSlot,
  WearableItemOnCharacter,
} from "bondage-fantasy-common";

export function CharacterWearables(props: { character: Character }) {
  function getSortedWearables(): WearableItemOnCharacter[] {
    const allSlots = Object.values(ItemSlot);
    return props.character.wearables.sort((a, b) => {
      return allSlots.indexOf(a.slots[0]) - allSlots.indexOf(b.slots[0]);
    });
  }

  return (
    <div>
      {getSortedWearables().map((wearable) => (
        <div key={wearable.slots[0]}>{wearable.name}</div>
      ))}
    </div>
  );
}
