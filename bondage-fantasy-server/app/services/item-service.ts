import { ItemDao } from "#dao/item-dao";
import {
  InvalidItemException,
  ItemNotFoundException,
  NoAccessToItemException,
} from "#exceptions/exceptions";
import { inject } from "@adonisjs/core";
import { areSetsEqual, Item, ItemSlot } from "bondage-fantasy-common";
import { SequenceService } from "./sequence-service.js";
import { SequenceCode } from "#models/sequence-model";
import lockService, { LOCKS } from "./lock-service.js";

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

  async save(params: {
    itemId?: number;
    characterId: number;
    slots: ItemSlot[];
    name: string;
    description: string;
  }): Promise<void> {
    const locks =
      params.itemId == null
        ? [LOCKS.character(params.characterId)]
        : [LOCKS.character(params.characterId), LOCKS.item(params.itemId)];

    return await lockService.run(locks, "1s", async () => {
      if (params.itemId != null) {
        const item = await this.getById(params.itemId, {
          checkAccessForCharacterId: params.characterId,
        });
        if (!areSetsEqual(new Set(item.slots), new Set(params.slots))) {
          throw new InvalidItemException("You cannot modify item slots.");
        }
      }

      const newItem: Item = {
        id:
          params.itemId ??
          (await this.sequenceService.nextSequence(SequenceCode.ITEM)),
        ownerCharacterId: params.characterId,
        slots: params.slots,
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
