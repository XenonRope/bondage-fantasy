import { Character, Genitals, ItemSlot, Pronouns } from "./model.js";

export const TRUE = "TRUE";
// Cannot use string "FALSE" because Mustache interprets non-empty strings as true
export const FALSE = "";

export const VARIABLES = [
  "NAME",
  "HAS_VAGINA",
  "HAS_ONLY_VAGINA",
  "HAS_PENIS",
  "HAS_ONLY_PENIS",
  "IS_FUTA",
  "SHE_HER",
  "HE_HIM",
  ...Object.values(ItemSlot).map((slot) => `${slot}_ITEM_ID`),
  ...Object.values(ItemSlot).map((slot) => `${slot}_ITEM_NAME`),
  "ITEM_<id>_COUNT",
  "ITEM_<id>_ACCESS",
];

export function getCharacterVariables({
  character,
  ownedItemsIds,
}: {
  character: Character;
  ownedItemsIds: number[];
}): Record<string, string> {
  const slotItemsIds = Object.values(ItemSlot).reduce((acc, slot) => {
    const item = character.wearables.find((wearable) =>
      wearable.slots.includes(slot),
    );
    return {
      ...acc,
      [`${slot}_ITEM_ID`]: item?.itemId?.toString(),
    };
  }, {});

  const slotItemsNames = Object.values(ItemSlot).reduce((acc, slot) => {
    const item = character.wearables.find((wearable) =>
      wearable.slots.includes(slot),
    );
    return {
      ...acc,
      [`${slot}_ITEM_NAME`]: item?.name,
    };
  }, {});

  const itemCounts = character.inventory.reduce((acc, item) => {
    return {
      ...acc,
      [`ITEM_${item.itemId}_COUNT`]: item.count.toString(),
    };
  }, {});

  const itemAccess = [...ownedItemsIds, ...character.sharedItemsIds].reduce(
    (acc, itemId) => {
      return {
        ...acc,
        [`ITEM_${itemId}_ACCESS`]: TRUE,
      };
    },
    {},
  );

  return {
    NAME: character.name,
    HAS_VAGINA: getBooleanVariable(
      character.genitals === Genitals.VAGINA ||
        character.genitals === Genitals.FUTA,
    ),
    HAS_ONLY_VAGINA: getBooleanVariable(character.genitals === Genitals.VAGINA),
    HAS_PENIS: getBooleanVariable(
      character.genitals === Genitals.PENIS ||
        character.genitals === Genitals.FUTA,
    ),
    HAS_ONLY_PENIS: getBooleanVariable(character.genitals === Genitals.PENIS),
    IS_FUTA: getBooleanVariable(character.genitals === Genitals.FUTA),
    SHE_HER: getBooleanVariable(character.pronouns === Pronouns.SHE_HER),
    HE_HIM: getBooleanVariable(character.pronouns === Pronouns.HE_HIM),
    ...slotItemsIds,
    ...slotItemsNames,
    ...itemCounts,
    ...itemAccess,
  };
}

function getBooleanVariable(value: boolean): string {
  return value ? TRUE : FALSE;
}
