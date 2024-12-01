import { Account, Character } from "bondage-fantasy-common";

export function accountDto(account: Account): Account {
  const dto: Omit<Account, "password"> = {
    id: account.id,
    username: account.username,
  };

  return dto as Account;
}

export function characterDto(character: Character): Character {
  const dto: Omit<Character, "accountId"> = {
    id: character.id,
    name: character.name,
    pronouns: character.pronouns,
    genitals: character.genitals,
  };

  return dto as Character;
}
