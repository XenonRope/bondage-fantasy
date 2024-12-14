import { sessionApi } from "../api/session-api";
import { useAppStore } from "../store";
import { errorService } from "./error-service";

const DEFAULT_CHARACTER_ID_KEY = "defaultCharacterId";

export class CharacterService {
  async selectCharacter(characterId: number): Promise<void> {
    try {
      const sessionData = await sessionApi.getSessionData({
        characterId,
      });
      useAppStore.getState().updateSessionData(sessionData);
      this.setDefaultCharacter(characterId);
      if (sessionData.zone) {
        useAppStore.getState().navigate?.("/explore");
      } else {
        useAppStore.getState().navigate?.("/zones");
      }
    } catch (error) {
      errorService.handleUnexpectedError(error);
    }
  }

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
