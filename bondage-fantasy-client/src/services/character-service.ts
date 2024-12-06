const DEFAULT_CHARACTER_ID_KEY = "defaultCharacterId";

export class CharacterService {
  setDefaultCharacterForAccount(charcterId: number, accountId: number): void {
    localStorage.setItem(
      DEFAULT_CHARACTER_ID_KEY,
      `${accountId}-${charcterId}`,
    );
  }

  getDefaultCharacterForAccount(expectedAccountId: number): number | undefined {
    const defaultCharacterId = localStorage.getItem(DEFAULT_CHARACTER_ID_KEY);
    if (!defaultCharacterId) {
      return undefined;
    }
    const [accountId, characterId] = defaultCharacterId.split("-");
    if (accountId !== expectedAccountId.toString()) {
      return undefined;
    }
    return parseInt(characterId);
  }
}

export const characterService = new CharacterService();
