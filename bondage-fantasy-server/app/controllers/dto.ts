import { Account, Character, SessionData } from "bondage-fantasy-common";

export function accountDto(account: Account): Account {
  return {
    ...account,
    password: undefined as unknown as string,
  };
}

export function characterDto(character: Character): Character {
  return { ...character, accountId: undefined as unknown as number };
}

export function sessionDataDto(sessionData: SessionData): SessionData {
  return {
    account: sessionData.account ? accountDto(sessionData.account) : undefined,
    character: sessionData.character
      ? characterDto(sessionData.character)
      : undefined,
    zone: sessionData.zone,
  };
}
