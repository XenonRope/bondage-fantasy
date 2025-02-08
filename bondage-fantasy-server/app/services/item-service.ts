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
import { MultipartFile } from "@adonisjs/core/bodyparser";
import { cuid } from "@adonisjs/core/helpers";
import drive from "@adonisjs/drive/services/main";

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
      imageKey?: string;
      image?: MultipartFile;
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
      const existingItem =
        params.itemId != null
          ? await this.getById(params.itemId, {
              checkAccessForCharacterId: params.characterId,
            })
          : undefined;
      if (existingItem != null) {
        if (existingItem.type !== params.type) {
          throw new InvalidItemException(
            "You cannot change the type of an item",
          );
        }
        if (
          params.imageKey != null &&
          params.imageKey != existingItem.imageKey
        ) {
          throw new InvalidItemException(
            "Image key cannot be changed manually",
          );
        }
      }

      const itemId =
        params.itemId ??
        (await this.sequenceService.nextSequence(SequenceCode.ITEM));
      const imageKey = params.image
        ? `images/${cuid()}.${params.image.extname}`
        : params.imageKey;

      if (
        existingItem?.imageKey &&
        existingItem.imageKey !== imageKey &&
        (await drive.use().exists(existingItem.imageKey))
      ) {
        await drive.use().delete(existingItem.imageKey);
      }

      const newItem: Item =
        params.type === ItemType.WEARABLE
          ? {
              id: itemId,
              type: params.type,
              ownerCharacterId: params.characterId,
              name: params.name,
              description: params.description,
              imageKey,
              slots: params.slots,
            }
          : {
              id: itemId,
              type: params.type,
              ownerCharacterId: params.characterId,
              name: params.name,
              description: params.description,
              imageKey,
            };

      if (params.itemId == null) {
        await this.itemDao.insert(newItem);
      } else {
        await this.itemDao.replace(newItem);
      }

      if (params.image) {
        await params.image.moveToDisk(imageKey!);
      }
    });
  }
}
