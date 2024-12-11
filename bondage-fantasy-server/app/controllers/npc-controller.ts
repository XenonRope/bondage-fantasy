import { NpcService } from "#services/npc-service";
import { npcCreateRequestValidator } from "#validators/npc-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { Npc } from "bondage-fantasy-common";
import { getCharacterId } from "./utils.js";
import { ZoneService } from "#services/zone-service";
import { NpcDao } from "#dao/npc-dao";

@inject()
export default class NpcController {
  constructor(
    private npcService: NpcService,
    private npcDao: NpcDao,
    private zoneService: ZoneService,
  ) {}

  async create(ctx: HttpContext): Promise<Npc> {
    const characterId = await getCharacterId(ctx);
    const { zoneId, name } = await ctx.request.validateUsing(
      npcCreateRequestValidator,
    );

    return await this.npcService.create({
      characterId,
      zoneId,
      name,
    });
  }

  async listByZoneId(ctx: HttpContext): Promise<Npc[]> {
    const zoneId: number = ctx.params.zoneId;
    const characterId = await getCharacterId(ctx);
    await this.zoneService.assertCharacterIsOwnerOfZone(characterId, zoneId);

    return await this.npcDao.getManyByZoneId(zoneId);
  }
}
