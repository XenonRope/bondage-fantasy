import { sessionApi } from "../api/session-api";
import { useAppStore } from "../store";
import { characterService } from "./character-service";
import { errorService } from "./error-service";
import { LoginRequest } from "bondage-fantasy-common";

export class SessionService {
  async refreshSession(): Promise<void> {
    try {
      const characterId = characterService.getDefaultCharacter();
      const sessionData = await sessionApi.getSessionData({
        characterId,
      });
      useAppStore.getState().updateSessionData(sessionData);
    } catch (error) {
      errorService.handleUnexpectedError(error);
    }
  }

  async login(request: LoginRequest): Promise<void> {
    const characterId = characterService.getDefaultCharacter();
    const sessionData = await sessionApi.login(request, { characterId });
    useAppStore.getState().updateSessionData(sessionData);
    if (sessionData.zone) {
      useAppStore.getState().navigate?.("/explore");
    } else if (sessionData.character) {
      useAppStore.getState().navigate?.("/zones");
    } else {
      useAppStore.getState().navigate?.("/characters");
    }
  }

  async logout(): Promise<void> {
    await sessionApi.logout();
    useAppStore.getState().updateSessionData({});
  }
}

export const sessionService = new SessionService();
