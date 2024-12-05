import { accountApi } from "../api/account-api";
import { characterApi } from "../api/character-api";
import { sessionApi } from "../api/session-api";
import { useAppStore } from "../store";
import { isErrorResponseWithCode } from "../utils/error";
import { characterService } from "./character-service";
import { errorService } from "./error-service";
import { Account, ErrorCode, LoginRequest } from "bondage-fantasy-common";

export class SessionService {
  async restoreSession(): Promise<void> {
    try {
      const account = await accountApi.getMyAccount();
      useAppStore.getState().setAccount(account);
      const characterId = characterService.getDefaultCharacter();
      if (characterId != null) {
        const character = await characterApi.getById(characterId);
        useAppStore.getState().setCharacter(character);
      }
    } catch (error) {
      if (isErrorResponseWithCode(error, ErrorCode.E_UNAUTHORIZED_ACCESS)) {
        return;
      }
      errorService.handleUnexpectedError(error);
    } finally {
      useAppStore.getState().completeSessionRestore();
    }
  }

  async login(request: LoginRequest): Promise<Account> {
    const account = await sessionApi.login(request);
    useAppStore.getState().setAccount(account);
    return account;
  }
}

export const sessionService = new SessionService();
