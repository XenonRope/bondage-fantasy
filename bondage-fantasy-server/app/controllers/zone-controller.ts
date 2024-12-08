import { ZoneDao } from "#dao/zone-dao";
import { ZoneService } from "#services/zone-service";
import {
  zoneCreateRequestValidator,
  zoneJoinRequestValidator,
  zoneSearchRequestValidator,
} from "#validators/zone-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import {
  SessionData,
  ZoneCreateRequest,
  ZoneJoinRequest,
  ZoneSearchResponse,
  ZoneVision,
} from "bondage-fantasy-common";
import { zoneDto } from "./dto.js";
import { getCharacterId } from "./utils.js";
import { ZoneVisionService } from "#services/zone-vision-service";
import { SessionService } from "#services/session-service";

@inject()
export default class ZoneController {
  constructor(
    private zoneService: ZoneService,
    private zoneDao: ZoneDao,
    private zoneVisionService: ZoneVisionService,
    private sessionService: SessionService,
  ) {}

  async search(ctx: HttpContext): Promise<ZoneSearchResponse> {
    const { query, offset, limit } = await ctx.request.validateUsing(
      zoneSearchRequestValidator,
    );
    const { zones, total } = await this.zoneDao.search({
      query,
      offset,
      limit,
    });
    return {
      zones: zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        description: zone.description,
      })),
      total,
    };
  }

  async create(ctx: HttpContext) {
    const characterId = await getCharacterId(ctx);
    const { name, description, entrance, fields, connections } =
      (await ctx.request.validateUsing(
        zoneCreateRequestValidator,
      )) as ZoneCreateRequest;

    const zone = await this.zoneService.create({
      ownerCharacterId: characterId,
      name,
      description,
      entrance,
      fields,
      connections,
    });

    ctx.response.status(201).send(zoneDto(zone));
  }

  async join(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);
    const { zoneId } = (await ctx.request.validateUsing(
      zoneJoinRequestValidator,
    )) as ZoneJoinRequest;

    await this.zoneService.join({ characterId, zoneId });

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
  }
}
