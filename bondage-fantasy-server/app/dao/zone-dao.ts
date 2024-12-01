import { inject } from "@adonisjs/core";
import { Zone } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class ZoneDao {
  constructor(private db: Db) {}

  async insert(zone: Zone): Promise<void> {
    await this.getCollection().insertOne(zone);
  }

  private getCollection(): Collection<Zone> {
    return this.db.collection("zones");
  }
}
