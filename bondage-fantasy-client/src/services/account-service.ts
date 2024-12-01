import { accountApi } from "../api/account-api";
import { useAppStore } from "../store";
import { Account, AccountRegisterRequest } from "bondage-fantasy-common";

export class AccountService {
  async register(request: AccountRegisterRequest): Promise<Account> {
    const account = await accountApi.register(request);
    useAppStore.getState().setAccount(account);
    return account;
  }
}

export const accountService = new AccountService();
