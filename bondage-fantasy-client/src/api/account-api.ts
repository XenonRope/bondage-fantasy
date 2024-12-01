import { httpClient } from "./http-client";
import { Account, AccountRegisterRequest } from "bondage-fantasy-common";

class AccountApi {
  async getMyAccount(): Promise<Account> {
    return await httpClient.get("accounts/my");
  }

  async register(request: AccountRegisterRequest): Promise<Account> {
    return await httpClient.post("accounts", request);
  }
}

export const accountApi = new AccountApi();
