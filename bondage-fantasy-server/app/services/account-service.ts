import { AccountDao } from "#dao/account-dao";
import { UsernameAlreadyTakenException } from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import hash from "@adonisjs/core/services/hash";
import { SequenceService } from "./sequence-service.js";

@inject()
export default class AccountService {
  constructor(
    private accountDao: AccountDao,
    private sequenceService: SequenceService,
  ) {}

  async register(params: {
    username: string;
    password: string;
  }): Promise<void> {
    if (await this.accountDao.existsUsername(params.username)) {
      throw new UsernameAlreadyTakenException();
    }

    const account = {
      id: await this.sequenceService.nextSequence(SequenceCode.ACCOUNT),
      username: params.username,
      password: await hash.make(params.password),
    };

    await this.accountDao.insert(account);
  }
}
