import { Character, Genitals, ItemSlot, Pronouns } from "./model.js";

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
];

export function getVariables(params: { character: Character }) {
  const itemIds = Object.values(ItemSlot).reduce((acc, slot) => {
    const item = params.character.wearables.find((wearable) =>
      wearable.slots.includes(slot),
    );
    return {
      ...acc,
      [`${slot}_ITEM_ID`]: item?.itemId,
    };
  }, {});

  const itemNames = Object.values(ItemSlot).reduce((acc, slot) => {
    const item = params.character.wearables.find((wearable) =>
      wearable.slots.includes(slot),
    );
    return {
      ...acc,
      [`${slot}_ITEM_NAME`]: item?.name,
    };
  }, {});

  return {
    NAME: params.character.name,
    HAS_VAGINA:
      params.character.genitals === Genitals.VAGINA ||
      params.character.genitals === Genitals.FUTA,
    HAS_ONLY_VAGINA: params.character.genitals === Genitals.VAGINA,
    HAS_PENIS:
      params.character.genitals === Genitals.PENIS ||
      params.character.genitals === Genitals.FUTA,
    HAS_ONLY_PENIS: params.character.genitals === Genitals.PENIS,
    IS_FUTA: params.character.genitals === Genitals.FUTA,
    SHE_HER: params.character.pronouns === Pronouns.SHE_HER,
    HE_HIM: params.character.pronouns === Pronouns.HE_HIM,
    ...itemIds,
    ...itemNames,
  };
}
