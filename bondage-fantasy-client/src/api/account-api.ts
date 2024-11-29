import { httpClient } from "./http-client";

class AccountApi {
  async register(params: {
    username: string;
    password: string;
  }): Promise<void> {
    return await httpClient.post("accounts/register", {
      username: params.username,
      password: params.password,
    });
  }
}

export const accountApi = new AccountApi();
