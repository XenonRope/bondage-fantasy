import CharacterService from "#services/character-service";
import { characterCreateRequestValidator } from "#validators/character-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { Character, CharacterCreateRequest } from "bondage-fantasy-common";
import { characterDto } from "./dto.js";
import { CharacterDao } from "#dao/character-dao";
import { CharacterNotFoundException } from "#exceptions/exceptions";

@inject()
export default class CharacterController {
  constructor(
    private characterService: CharacterService,
    private characterDao: CharacterDao,
  ) {}

  async getById(ctx: HttpContext): Promise<Character> {
    const characterId: number = ctx.params.id;
    const character = await this.characterDao.getById(characterId);
    if (character == null || character.accountId !== ctx.auth.user!.id) {
      throw new CharacterNotFoundException();
    }

    return characterDto(character);
  }

  async list({ response, auth }: HttpContext) {
    const characters = await this.characterDao.getManyByAccountId(
      auth.user!.id,
    );

    response.status(200).send(characters.map(characterDto));
  }

  async create({ request, response, auth }: HttpContext) {
    const { name, pronouns, genitals }: CharacterCreateRequest =
      await request.validateUsing(characterCreateRequestValidator);

    const character = await this.characterService.create({
      accountId: auth.user!.id,
      name,
      pronouns,
      genitals,
    });

    response.status(201).send(characterDto(character));
  }
}
