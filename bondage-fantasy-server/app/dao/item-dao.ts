import { inject } from "@adonisjs/core";
import { Collection, Db, Document, Filter } from "mongodb";
import { Item, ItemType } from "bondage-fantasy-common";
import { escapeRegex } from "../utils.js";
import { CollectionName } from "#models/collection-model";

@inject()
export class ItemDao {
  constructor(private db: Db) {}

  async getById(itemId: number): Promise<Item | null> {
    return await this.getCollection().findOne({ id: itemId });
  }

  async getManyByIds(itemIds: number[]): Promise<Item[]> {
    return await this.getCollection()
      .find({ id: { $in: itemIds } })
      .toArray();
  }

  async getMany(params: {
    itemsIds?: number[];
    fields?: readonly string[];
    rls?: {
      ownerCharacterId: number;
      sharedItemsIds: number[];
    };
  }): Promise<Item[]> {
    const filters: Filter<Item>[] = [];
    if (params.itemsIds != null) {
      filters.push({ id: { $in: params.itemsIds } });
    }
    if (params.rls != null) {
      filters.push({
        $or: [
          { ownerCharacterId: params.rls.ownerCharacterId },
          { id: { $in: params.rls.sharedItemsIds } },
        ],
      });
    }
    const filter = filters.length > 0 ? { $and: filters } : {};
    const projection = params.fields?.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {} as Document);

    const cursor = this.getCollection().find(filter);
    if (projection != null) {
      cursor.project(projection);
    }

    return await cursor.toArray();
  }

  async getIdsByCharacterId(characterId: number): Promise<number[]> {
    const items = await this.getCollection()
      .find({ ownerCharacterId: characterId })
      .project({ id: 1 })
      .toArray();

    return items.map((item) => item.id);
  }

  async search(params: {
    query: string;
    characterId: number;
    offset: number;
    limit: number;
    includeItemsIds?: number[];
    sharedItemsIds?: number[];
    types?: ItemType[];
  }): Promise<{ items: Item[]; total: number }> {
    const filters: Filter<Item>[] = [];
    filters.push({
      name: { $regex: escapeRegex(params.query), $options: "i" },
    });
    if (params.types != null) {
      filters.push({ type: { $in: params.types } });
    }
    const filter: Filter<Item> = {
      $and: [
        {
          $or: [
            { $and: filters },
            { id: { $in: params.includeItemsIds ?? [] } },
          ],
        },
        {
          $or: [
            { ownerCharacterId: params.characterId },
            { id: { $in: params.sharedItemsIds ?? [] } },
          ],
        },
      ],
    };
    const items = await this.getCollection()
      .find(filter)
      .skip(params.offset)
      .limit(params.limit)
      .toArray();
    const total = await this.getCollection().countDocuments(filter);
    return { items, total };
  }

  async insert(item: Item): Promise<void> {
    await this.getCollection().insertOne(item);
  }

  async replace(item: Item): Promise<void> {
    await this.getCollection().replaceOne({ id: item.id }, item);
  }

  private getCollection(): Collection<Item> {
    return this.db.collection(CollectionName.ITEMS);
  }
}
