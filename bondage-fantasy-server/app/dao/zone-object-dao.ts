import { inject } from "@adonisjs/core";
import {
  CharacterObject,
  ObjectType,
  Position,
  ZoneObject,
} from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class ZoneObjectDao {
  constructor(private db: Db) {}

  async getCharacterObject(
    characterId: number,
  ): Promise<CharacterObject | null> {
    return (await this.getCollection().findOne({
      type: ObjectType.CHARACTER,
      characterId,
    })) as CharacterObject | null;
  }

  async getManyByPosition(position: Position): Promise<ZoneObject[]> {
    return await this.getCollection()
      .find({ "position.x": position.x, "position.y": position.y })
      .toArray();
  }

  async insert(object: ZoneObject): Promise<void> {
    await this.getCollection().insertOne(object);
  }

  private getCollection(): Collection<ZoneObject> {
    return this.db.collection("zone_objects");
  }
}
