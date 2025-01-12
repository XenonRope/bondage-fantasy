import { ZoneDao } from "#dao/zone-dao";
import { SessionService } from "#services/session-service";
import { ZoneService } from "#services/zone-service";
import {
  zoneInteractRequestValidator,
  zoneJoinRequestValidator,
  zoneMoveRequestValidator,
  zoneSaveRequestValidator,
  zoneSearchRequestValidator,
} from "#validators/zone-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import {
  SessionData,
  Zone,
  ZoneJoinRequest,
  ZoneSearchResponse,
} from "bondage-fantasy-common";
import { getCharacterId } from "./utils.js";

@inject()
export default class ZoneController {
  constructor(
    private zoneService: ZoneService,
    private zoneDao: ZoneDao,
    private sessionService: SessionService,
  ) {}

  async search(ctx: HttpContext): Promise<ZoneSearchResponse> {
    const characterId = await getCharacterId(ctx);
    const { query, offset, limit } = await ctx.request.validateUsing(
      zoneSearchRequestValidator,
    );
    const { zones, total } = await this.zoneDao.search({
      query,
      characterId,
      offset,
      limit,
    });
    return {
      zones: zones.map((zone) => ({
        id: zone.id,
        ownerCharacterId: zone.ownerCharacterId,
        name: zone.name,
        description: zone.description,
        draft: zone.draft,
      })),
      total,
    };
  }

  async getById(ctx: HttpContext): Promise<Zone> {
    const zoneId: number = ctx.params.id;
    const characterId = await getCharacterId(ctx);

    const zone = await this.zoneService.get(zoneId, {
      checkAccessForCharacterId: characterId,
    });

    return zone;
  }

  async save(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);
    const {
      zoneId,
      name,
      description,
      draft,
      entrance,
      fields,
      connections,
      objects,
    } = await ctx.request.validateUsing(zoneSaveRequestValidator);

    await this.zoneService.save({
      zoneId,
      characterId,
      name,
      description,
      draft,
      entrance,
      fields,
      connections,
      objects,
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

  async interactWithEvent(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);
    const { eventId } = await ctx.request.validateUsing(
      zoneInteractRequestValidator,
    );

    await this.zoneService.interactWithEvent({ characterId, eventId });

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
  }
}
