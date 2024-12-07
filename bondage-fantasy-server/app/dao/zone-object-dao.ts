import { inject } from "@adonisjs/core";
import { ObjectType, ZoneObject } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class ZoneObjectDao {
  constructor(private db: Db) {}

  async isCharacterInAnyZone(characterId: number): Promise<boolean> {
    const count = await this.getCollection().countDocuments({
      type: ObjectType.CHARACTER,
      characterId,
    });
    return count > 0;
  }

  async insert(object: ZoneObject): Promise<void> {
    await this.getCollection().insertOne(object);
  }

  private getCollection(): Collection<ZoneObject> {
    return this.db.collection("zone_objects");
  }
}
