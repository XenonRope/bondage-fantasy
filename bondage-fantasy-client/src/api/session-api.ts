import { httpClient } from "./http-client";
import { Account, LoginRequest } from "bondage-fantasy-common";

class SessionApi {
  async login(request: LoginRequest): Promise<Account> {
    return await httpClient.post("session/login", request);
  }
}

export const sessionApi = new SessionApi();
