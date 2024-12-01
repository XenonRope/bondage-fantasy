import CharacterService from "#services/character-service";
import { createCharacterValidator } from "#validators/character-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { CharacterCreateRequest } from "bondage-fantasy-common";
import { characterDto } from "./dto.js";
import { CharacterDao } from "#dao/character-dao";

@inject()
export default class CharacterController {
  constructor(
    private characterService: CharacterService,
    private characterDao: CharacterDao,
  ) {}

  async list({ response, auth }: HttpContext) {
    const characters = await this.characterDao.list({
      accountsIds: [auth.user!.id],
    });

    response.status(200).send(characters.map(characterDto));
  }

  async create({ request, response, auth }: HttpContext) {
    const { name, pronouns, genitals }: CharacterCreateRequest =
      await request.validateUsing(createCharacterValidator);

    const character = await this.characterService.create({
      accountId: auth.user!.id,
      name,
      pronouns,
      genitals,
    });

    response.status(201).send(characterDto(character));
  }
}
