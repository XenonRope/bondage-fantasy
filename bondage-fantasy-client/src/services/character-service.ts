const DEFAULT_CHARACTER_ID_KEY = "defaultCharacterId";

export class CharacterService {
  setDefaultCharacter(charcterId: number): void {
    localStorage.setItem(DEFAULT_CHARACTER_ID_KEY, charcterId.toString());
  }

  getDefaultCharacter(): number | undefined {
    const defaultCharacterId = parseInt(
      localStorage.getItem(DEFAULT_CHARACTER_ID_KEY) ?? "",
    );
    return isNaN(defaultCharacterId) ? undefined : defaultCharacterId;
  }
}

export const characterService = new CharacterService();
