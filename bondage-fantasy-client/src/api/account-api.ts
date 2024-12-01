import { httpClient } from "./http-client";
import { AccountRegisterRequest } from "bondage-fantasy-common";

class AccountApi {
  async register(request: AccountRegisterRequest): Promise<void> {
    return await httpClient.post("accounts", request);
  }
}

export const accountApi = new AccountApi();
