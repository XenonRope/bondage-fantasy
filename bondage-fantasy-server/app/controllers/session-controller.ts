import { AccountDao } from "#dao/account-dao";
import { InvalidUsernameOrPasswordException } from "#exceptions/exceptions";
import { SessionUser } from "#models/session-model";
import { SessionService } from "#services/session-service";
import { loginRequestValidator } from "#validators/session-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";
import { LoginRequest, SessionData } from "bondage-fantasy-common";
import { sessionDataDto } from "./dto.js";
import { getCharacterIdWithoutCheck } from "./utils.js";

@inject()
export default class SessionController {
  constructor(
    private accountDao: AccountDao,
    private sessionService: SessionService,
  ) {}

  async login(ctx: HttpContext): Promise<SessionData> {
    const { username, password }: LoginRequest =
      await ctx.request.validateUsing(loginRequestValidator);

    const account = await this.accountDao.getByUsername(username, {
      includePassword: true,
    });
    if (!account) {
      throw new InvalidUsernameOrPasswordException();
    }

    const correctCredentials = await hash.verify(account.password, password);
    if (!correctCredentials) {
      throw new InvalidUsernameOrPasswordException();
    }

    await ctx.auth.use("web").login(new SessionUser(account.id));

    const sessionData = await this.sessionService.getSessionData({
      account,
      characterId: getCharacterIdWithoutCheck(ctx),
    });

    return sessionDataDto(sessionData);
  }

  async logout(ctx: HttpContext) {
    await ctx.auth.use("web").logout();
    ctx.response.status(200).send({});
  }

  async getSessionData(ctx: HttpContext): Promise<SessionData> {
    const authenticated = await ctx.auth.use("web").check();
    if (!authenticated) {
      return {};
    }

    const accountId = await ctx.auth.use("web").user?.id;
    const sessionData = await this.sessionService.getSessionData({
      account: accountId,
      characterId: getCharacterIdWithoutCheck(ctx),
    });

    return sessionDataDto(sessionData);
  }
}
