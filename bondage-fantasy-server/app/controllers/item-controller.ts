import { ItemService } from "#services/item-service";
import { itemSaveRequestValidator } from "#validators/item-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { getCharacterId } from "./utils.js";
import { SessionData } from "bondage-fantasy-common";
import { SessionService } from "#services/session-service";

@inject()
export default class ItemController {
  constructor(
    private itemService: ItemService,
    private sessionService: SessionService,
  ) {}

  async save(ctx: HttpContext): Promise<SessionData> {
    const { itemId, slots, name, description } =
      await ctx.request.validateUsing(itemSaveRequestValidator);
    const characterId = await getCharacterId(ctx);

    await this.itemService.save({
      itemId,
      characterId,
      slots,
      name,
      description,
    });

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
  }
}
