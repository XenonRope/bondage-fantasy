import { getCharacterId } from "#middleware/character-middleware";
import { ZoneService } from "#services/zone-service";
import { zoneCreateRequestValidator } from "#validators/zone-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { ZoneCreateRequest } from "bondage-fantasy-common";
import { zoneDto } from "./dto.js";

@inject()
export default class ZoneController {
  constructor(private zoneService: ZoneService) {}

  async create({ request, response, containerResolver }: HttpContext) {
    const characterId = await getCharacterId(containerResolver);
    const { name, description, fields, connections } =
      (await request.validateUsing(
        zoneCreateRequestValidator,
      )) as ZoneCreateRequest;

    const zone = await this.zoneService.create({
      ownerCharacterId: characterId,
      name,
      description,
      fields,
      connections,
    });

    response.status(201).send(zoneDto(zone));
  }
}
