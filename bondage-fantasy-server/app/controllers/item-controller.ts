import { ItemService } from "#services/item-service";
import {
  itemSaveRequestValidator,
  itemSearchRequestValidator,
} from "#validators/item-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { getCharacterId } from "./utils.js";
import { Item, ItemSearchResponse, SessionData } from "bondage-fantasy-common";
import { SessionService } from "#services/session-service";
import { ItemDao } from "#dao/item-dao";
import { ItemType } from "bondage-fantasy-common";

@inject()
export default class ItemController {
  constructor(
    private itemService: ItemService,
    private itemDao: ItemDao,
    private sessionService: SessionService,
  ) {}

  async save(ctx: HttpContext): Promise<SessionData> {
    const request = await ctx.request.validateUsing(itemSaveRequestValidator);
    const characterId = await getCharacterId(ctx);

    await this.itemService.save(
      request.type === ItemType.STORABLE
        ? {
            itemId: request.itemId,
            characterId,
            name: request.name,
            description: request.description,
            type: request.type,
          }
        : {
            itemId: request.itemId,
            characterId,
            name: request.name,
            description: request.description,
            type: request.type,
            slots: request.slots,
          },
    );

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
  }

  async getById(ctx: HttpContext): Promise<Item> {
    const itemId: number = ctx.params.id;
    const characterId = await getCharacterId(ctx);

    const zone = await this.itemService.getById(itemId, {
      checkAccessForCharacterId: characterId,
    });

    return zone;
  }

  async search(ctx: HttpContext): Promise<ItemSearchResponse> {
    const { query, offset, limit } = await ctx.request.validateUsing(
      itemSearchRequestValidator,
    );
    const characterId = await getCharacterId(ctx);
    const { items, total } = await this.itemDao.search({
      query,
      characterId,
      offset,
      limit,
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
      })),
      total,
    };
  }
}
