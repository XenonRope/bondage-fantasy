import { AccountDao } from "#dao/account-dao";
import { AccountNotFoundException } from "#exceptions/exceptions";
import { SessionUser } from "#models/session-model";
import AccountService from "#services/account-service";
import { accountRegisterRequestValidator } from "#validators/account-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { AccountRegisterRequest } from "bondage-fantasy-common";
import { accountDto } from "./dto.js";

@inject()
export default class AccountController {
  constructor(
    private accountService: AccountService,
    private accountDao: AccountDao,
  ) {}

  async getMyAccount({ response, auth }: HttpContext) {
    const account = await this.accountDao.getById(auth.user!.id);
    if (!account) {
      throw new AccountNotFoundException();
    }

    response.status(200).send(accountDto(account!));
  }

  async register({ request, response, auth }: HttpContext) {
    const { username, password }: AccountRegisterRequest =
      await request.validateUsing(accountRegisterRequestValidator);

    const account = await this.accountService.register({ username, password });

    await auth.use("web").login(new SessionUser(account.id));

    response.status(201).send(accountDto(account));
  }
}
