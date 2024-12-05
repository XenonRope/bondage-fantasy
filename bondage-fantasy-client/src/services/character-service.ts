const CHARACTER_ID_KEY = "characterId";

export class CharacterService {
  setDefaultCharacter(charcterId: number): void {
    localStorage.setItem(CHARACTER_ID_KEY, charcterId.toString());
  }

  getDefaultCharacter(): number | undefined {
    const characterId = localStorage.getItem(CHARACTER_ID_KEY);
    return characterId ? parseInt(characterId) : undefined;
  }
}

export const characterService = new CharacterService();
