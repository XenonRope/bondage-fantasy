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

  async getManyByZone(zoneId: number): Promise<ZoneObject[]> {
    return await this.getCollection().find({ zoneId }).toArray();
  }

  async getManyByZoneAndPosition(
    zoneId: number,
    position: Position,
  ): Promise<ZoneObject[]> {
    return await this.getCollection()
      .find({ zoneId, "position.x": position.x, "position.y": position.y })
      .toArray();
  }

  async insert(object: ZoneObject): Promise<void> {
    await this.getCollection().insertOne(object);
  }

  async updatePosition(id: number, position: Position): Promise<void> {
    await this.getCollection().updateOne({ id }, { $set: { position } });
  }

  async deleteCharacterObject(characterId: number): Promise<void> {
    await this.getCollection().deleteOne({
      type: ObjectType.CHARACTER,
      characterId,
    });
  }

  async deleteCharacterObjectsByZoneId(zoneId: number): Promise<void> {
    await this.getCollection().deleteMany({
      type: ObjectType.CHARACTER,
      zoneId,
    });
  }

  async deleteManyInZoneExcludingPositions(params: {
    zoneId: number;
    positions: Position[];
  }): Promise<void> {
    if (params.positions.length === 0) {
      return;
    }

    const positionsFilters = params.positions.map((position) => ({
      $or: [
        { "position.x": { $ne: position.x } },
        { "position.y": { $ne: position.y } },
      ],
    }));

    await this.getCollection().deleteMany({
      $and: [{ zoneId: params.zoneId }, ...positionsFilters],
    });
  }

  private getCollection(): Collection<ZoneObject> {
    return this.db.collection("zone_objects");
  }
}
