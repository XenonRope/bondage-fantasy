import { CharacterDao } from "#dao/character-dao";
import { TooManyCharactersException } from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  Character,
  CHARACTERS_MAX_COUNT,
  Genitals,
  Pronouns,
} from "bondage-fantasy-common";
import lockService, { LOCKS } from "./lock-service.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export default class CharacterService {
  constructor(
    private characterDao: CharacterDao,
    private sequenceService: SequenceService,
  ) {}

  async create(params: {
    accountId: number;
    name: string;
    pronouns: Pronouns;
    genitals: Genitals;
  }): Promise<Character> {
    return await lockService.run(
      LOCKS.account(params.accountId),
      "1s",
      async () => {
        const charactersCount = await this.characterDao.countByAccountId(
          params.accountId,
        );
        if (charactersCount >= CHARACTERS_MAX_COUNT) {
          throw new TooManyCharactersException();
        }

        const character: Character = {
          id: await this.sequenceService.nextSequence(SequenceCode.CHARACTER),
          accountId: params.accountId,
          name: params.name,
          pronouns: params.pronouns,
          genitals: params.genitals,
        };

        await this.characterDao.insert(character);

        return character;
      },
    );
  }
}
