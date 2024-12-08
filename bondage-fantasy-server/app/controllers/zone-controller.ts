import { ZoneDao } from "#dao/zone-dao";
import { SessionService } from "#services/session-service";
import { ZoneService } from "#services/zone-service";
import {
  zoneCreateRequestValidator,
  zoneEditRequestValidator,
  zoneJoinRequestValidator,
  zoneMoveRequestValidator,
  zoneSearchRequestValidator,
} from "#validators/zone-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import {
  SessionData,
  Zone,
  ZoneCreateRequest,
  ZoneEditRequest,
  ZoneJoinRequest,
  ZoneSearchResponse,
} from "bondage-fantasy-common";
import { zoneDto } from "./dto.js";
import { getCharacterId } from "./utils.js";

@inject()
export default class ZoneController {
  constructor(
    private zoneService: ZoneService,
    private zoneDao: ZoneDao,
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

  async getById(ctx: HttpContext): Promise<Zone> {
    const zoneId: number = ctx.params.id;
    const characterId = await getCharacterId(ctx);

    const zone = await this.zoneService.get(zoneId, {
      checkAccessForCharacterId: characterId,
    });

    return zoneDto(zone);
  }

  async edit(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);
    const { zoneId, name, description, entrance, fields, connections } =
      (await ctx.request.validateUsing(
        zoneEditRequestValidator,
      )) as ZoneEditRequest;

    await this.zoneService.edit({
      zoneId,
      characterId,
      name,
      description,
      entrance,
      fields,
      connections,
    });

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
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

  async leave(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);

    await this.zoneService.leave({ characterId });

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
  }

  async move(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);
    const { destination } = await ctx.request.validateUsing(
      zoneMoveRequestValidator,
    );

    await this.zoneService.move({ characterId, destination });

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
  }
}
