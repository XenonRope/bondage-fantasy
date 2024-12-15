import { NpcDao } from "#dao/npc-dao";
import { NpcService } from "#services/npc-service";
import { npcCreateRequestValidator } from "#validators/npc-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { Npc, NpcCreateRequest } from "bondage-fantasy-common";
import { npcDto } from "./dto.js";
import { getCharacterId } from "./utils.js";

@inject()
export default class NpcController {
  constructor(
    private npcService: NpcService,
    private npcDao: NpcDao,
  ) {}

  async create(ctx: HttpContext): Promise<void> {
    const characterId = await getCharacterId(ctx);
    const { name }: NpcCreateRequest = await ctx.request.validateUsing(
      npcCreateRequestValidator,
    );

    await this.npcService.create({
      characterId,
      name,
    });
  }

  async list(ctx: HttpContext): Promise<Npc[]> {
    const characterId = await getCharacterId(ctx);
    const npcList = await this.npcDao.getManyByCharacterId(characterId);

    return npcList.map(npcDto);
  }
}
