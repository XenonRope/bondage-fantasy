import { httpClient } from "./http-client";
import { Account, AccountRegisterRequest } from "bondage-fantasy-common";

class AccountApi {
  async register(request: AccountRegisterRequest): Promise<Account> {
    return await httpClient.post("accounts", request);
  }
}

export const accountApi = new AccountApi();
