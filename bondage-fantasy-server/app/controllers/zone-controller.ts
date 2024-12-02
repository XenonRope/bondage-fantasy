import { ZoneService } from "#services/zone-service";
import { zoneCreateRequestValidator } from "#validators/zone-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { ZoneCreateRequest } from "bondage-fantasy-common";
import { zoneDto } from "./dto.js";
import { getCharacterId } from "./utils.js";

@inject()
export default class ZoneController {
  constructor(private zoneService: ZoneService) {}

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
}
