import { httpClient } from "./http-client";
import { LoginRequest, SessionData } from "bondage-fantasy-common";

class SessionApi {
  async login(
    request: LoginRequest,
    params?: { characterId?: number },
  ): Promise<SessionData> {
    return await httpClient.post("session/login", request, {
      characterId: params?.characterId,
    });
  }

  async logout(): Promise<void> {
    return await httpClient.post("session/logout");
  }

  async getSessionData(params?: {
    characterId?: number;
  }): Promise<SessionData> {
    return await httpClient.get("session", {
      characterId: params?.characterId,
      doNotWaitForSessionInitialization: true,
    });
  }
}

export const sessionApi = new SessionApi();
