import { AccountDao } from "#dao/account-dao";
import { CharacterDao } from "#dao/character-dao";
import { inject } from "@adonisjs/core";
import { Account, SessionData } from "bondage-fantasy-common";
import { ZoneVisionService } from "./zone-vision-service.js";

@inject()
export class SessionService {
  constructor(
    private accountDao: AccountDao,
    private characterDao: CharacterDao,
    private zoneVisionService: ZoneVisionService,
  ) {}

  async getSessionData(params: {
    account?: number | Account;
    characterId?: number;
  }): Promise<SessionData> {
    if (params.account == null) {
      return {};
    }
    const account =
      typeof params.account === "number"
        ? await this.accountDao.getById(params.account)
        : params.account;
    if (!account) {
      // Rare situation where an account has been deleted
      return {};
    }

    if (params.characterId == null) {
      return {
        account,
      };
    }

    const character = await this.characterDao.getById(params.characterId);
    if (character == null || character.accountId !== account.id) {
      // Do not throw exception here. This situation means that character was deleted or the user has invalid data in local storage.
      return {
        account,
      };
    }

    const zone = await this.zoneVisionService.tryGetZoneVision(
      params.characterId,
    );
    if (zone == null) {
      return {
        account,
        character,
      };
    }

    return {
      account,
      character,
      zone,
    };
  }
}
