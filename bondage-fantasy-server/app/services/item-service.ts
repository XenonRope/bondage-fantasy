import { ItemDao } from "#dao/item-dao";
import {
  InvalidItemException,
  ItemNotFoundException,
  NoAccessToItemException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import { Item, ItemSlot, ItemType } from "bondage-fantasy-common";
import lockService, { LOCKS } from "./lock-service.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export class ItemService {
  constructor(
    private itemDao: ItemDao,
    private sequenceService: SequenceService,
  ) {}

  async getById(
    itemId: number,
    params?: { checkAccessForCharacterId?: number },
  ): Promise<Item> {
    const item = await this.itemDao.getById(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }
    if (
      params?.checkAccessForCharacterId != null &&
      params.checkAccessForCharacterId !== item.ownerCharacterId
    ) {
      throw new NoAccessToItemException();
    }
    return item;
  }

  async save(
    params: {
      itemId?: number;
      characterId: number;
      name: string;
      description: string;
    } & (
      | {
          type: ItemType.STORABLE;
        }
      | {
          type: ItemType.WEARABLE;
          slots: ItemSlot[];
        }
    ),
  ): Promise<void> {
    const locks =
      params.itemId == null
        ? [LOCKS.character(params.characterId)]
        : [LOCKS.character(params.characterId), LOCKS.item(params.itemId)];

    return await lockService.run(locks, "1s", async () => {
      if (params.itemId != null) {
        const existingItem = await this.getById(params.itemId, {
          checkAccessForCharacterId: params.characterId,
        });
        if (existingItem.type !== params.type) {
          throw new InvalidItemException(
            "You cannot change the type of an item",
          );
        }
      }

      const itemId =
        params.itemId ??
        (await this.sequenceService.nextSequence(SequenceCode.ITEM));
      const newItem: Item =
        params.type === ItemType.WEARABLE
          ? {
              id: itemId,
              type: params.type,
              ownerCharacterId: params.characterId,
              name: params.name,
              description: params.description,
              slots: params.slots,
            }
          : {
              id: itemId,
              type: params.type,
              ownerCharacterId: params.characterId,
              name: params.name,
              description: params.description,
            };

      if (params.itemId == null) {
        await this.itemDao.insert(newItem);
      } else {
        await this.itemDao.replace(newItem);
      }
    });
  }
}
