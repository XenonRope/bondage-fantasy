import { inject } from "@adonisjs/core";
import { Collection, Db } from "mongodb";
import { Item } from "bondage-fantasy-common";

@inject()
export class ItemDao {
  constructor(private db: Db) {}

  async getById(itemId: number): Promise<Item | null> {
    return await this.getCollection().findOne({ id: itemId });
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
