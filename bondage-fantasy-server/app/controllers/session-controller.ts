import { InvalidUsernameOrPasswordException } from "#exceptions/exceptions";
import { SessionUser } from "#models/session-model";
import AccountService from "#services/account-service";
import { loginValidator } from "#validators/session-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";
import { LoginRequest } from "bondage-fantasy-common";

@inject()
export default class SessionController {
  constructor(private accountService: AccountService) {}

  async login({ request, response, auth }: HttpContext) {
    const { username, password }: LoginRequest =
      await request.validateUsing(loginValidator);

    const account = await this.accountService.tryGetByUsername(username);
    if (!account) {
      throw new InvalidUsernameOrPasswordException();
    }

    const correctCredentials = await hash.verify(account.password, password);
    if (!correctCredentials) {
      throw new InvalidUsernameOrPasswordException();
    }

    await auth.use("web").login(new SessionUser(account.id));

    response.status(200).send("");
  }
}
