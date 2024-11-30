import { httpClient } from "./http-client";
import { LoginRequest } from "bondage-fantasy-common";

class SessionApi {
  async login(request: LoginRequest): Promise<void> {
    return await httpClient.post("session/login", request);
  }
}

export const sessionApi = new SessionApi();
