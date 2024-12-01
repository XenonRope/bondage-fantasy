import { Character } from "bondage-fantasy-common";

export function characterDto(character: Character): Character {
  const dto: Omit<Character, "accountId"> = {
    id: character.id,
    name: character.name,
    pronouns: character.pronouns,
    genitals: character.genitals,
  };

  return dto as Character;
}
