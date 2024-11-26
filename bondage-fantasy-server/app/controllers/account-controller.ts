import AccountService from "#services/account-service";
import { registerAccountValidator } from "#validators/account-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

@inject()
export default class AccountController {
  constructor(private accountService: AccountService) {}

  async register({ request, response }: HttpContext) {
    const { username, password } = await request.validateUsing(
      registerAccountValidator,
    );

    await this.accountService.register({ username, password });

    response.status(201).send("");
  }
}
