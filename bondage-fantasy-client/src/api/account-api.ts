import { httpClient } from "./http-client";
import { AccountRegisterRequest } from "bondage-fantasy-common";

class AccountApi {
  async register(requset: AccountRegisterRequest): Promise<void> {
    return await httpClient.post("accounts/register", {
      username: requset.username,
      password: requset.password,
    });
  }
}

export const accountApi = new AccountApi();
