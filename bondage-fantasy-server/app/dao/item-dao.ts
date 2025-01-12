import { inject } from "@adonisjs/core";
import { Collection, Db, Filter } from "mongodb";
import { Item } from "bondage-fantasy-common";
import { escapeRegex } from "../utils.js";

@inject()
export class ItemDao {
  constructor(private db: Db) {}

  async getById(itemId: number): Promise<Item | null> {
    return await this.getCollection().findOne({ id: itemId });
  }

  async search(params: {
    query: string;
    characterId: number;
    offset: number;
    limit: number;
  }): Promise<{ items: Item[]; total: number }> {
    const filters: Filter<Item>[] = [];
    filters.push({
      name: { $regex: escapeRegex(params.query), $options: "i" },
    });
    const filter: Filter<Item> = { $and: filters };
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
    return this.db.collection("items");
  }
}
