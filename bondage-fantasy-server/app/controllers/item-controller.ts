import { ItemDao } from "#dao/item-dao";
import CharacterService from "#services/character-service";
import { ItemService } from "#services/item-service";
import { SessionService } from "#services/session-service";
import {
  itemListRequestValidator,
  itemSaveRequestJsonValidator,
  itemSaveRequestValidator,
  itemSearchRequestValidator,
  itemWearRequestValidator,
} from "#validators/item-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import {
  Item,
  ITEM_LIST_REQUEST_FIELDS,
  ItemListResponse,
  ItemSearchResponse,
  ItemType,
  SessionData,
} from "bondage-fantasy-common";
import { itemDto, sessionDataDto } from "./dto.js";
import { getCharacterId, safeParseJson } from "./utils.js";

@inject()
export default class ItemController {
  constructor(
    private itemService: ItemService,
    private itemDao: ItemDao,
    private sessionService: SessionService,
    private characterService: CharacterService,
  ) {}

  async save(ctx: HttpContext): Promise<SessionData> {
    const { json, image } = await ctx.request.validateUsing(
      itemSaveRequestValidator,
    );
    const request = await itemSaveRequestJsonValidator.validate(
      safeParseJson(json),
    );
    const characterId = await getCharacterId(ctx);

    await this.itemService.save(
      request.type === ItemType.STORABLE
        ? {
            itemId: request.itemId,
            characterId,
            name: request.name,
            description: request.description,
            type: request.type,
            imageKey: request.imageKey,
            image,
          }
        : {
            itemId: request.itemId,
            characterId,
            name: request.name,
            description: request.description,
            type: request.type,
            imageKey: request.imageKey,
            image,
            slots: request.slots,
          },
    );

    return sessionDataDto(
      await this.sessionService.getSessionData({
        account: ctx.auth.user?.id,
        characterId,
      }),
    );
  }

  async getById(ctx: HttpContext): Promise<Item> {
    const itemId: number = ctx.params.id;
    const characterId = await getCharacterId(ctx);

    const item = await this.itemService.getById(itemId, {
      checkAccessForCharacterId: characterId,
    });

    return itemDto(item);
  }

  async list(ctx: HttpContext): Promise<ItemListResponse> {
    const { itemsIds, fields } = await ctx.request.validateUsing(
      itemListRequestValidator,
    );
    const characterId = await getCharacterId(ctx);
    const sharedItemsIds =
      await this.characterService.getSharedItemsIds(characterId);

    const items = await this.itemDao.getMany({
      itemsIds,
      fields: fields ?? ITEM_LIST_REQUEST_FIELDS,
    });

    return {
      items: items
        .filter(
          (item) =>
            item.ownerCharacterId === characterId ||
            sharedItemsIds.includes(item.id),
        )
        .map((item) => ({
          id: item.id,
          name: item.name,
        })),
    };
  }

  async search(ctx: HttpContext): Promise<ItemSearchResponse> {
    const { query, offset, limit, includeItemsIds, includeShared, types } =
      await ctx.request.validateUsing(itemSearchRequestValidator);
    const characterId = await getCharacterId(ctx);
    const sharedItemsIds = includeShared
      ? await this.characterService.getSharedItemsIds(characterId)
      : undefined;
    const { items, total } = await this.itemDao.search({
      query,
      characterId,
      offset,
      limit,
      includeItemsIds,
      sharedItemsIds,
      types,
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        description: item.description,
        imageKey: item.imageKey,
        shared: item.ownerCharacterId !== characterId,
      })),
      total,
    };
  }

  async wear(ctx: HttpContext): Promise<SessionData> {
    const { itemId } = await ctx.request.validateUsing(
      itemWearRequestValidator,
    );
    const characterId = await getCharacterId(ctx);
    await this.characterService.wearItem({
      characterId,
      itemId,
    });

    return sessionDataDto(
      await this.sessionService.getSessionData({
        account: ctx.auth.user?.id,
        characterId,
      }),
    );
  }
}
