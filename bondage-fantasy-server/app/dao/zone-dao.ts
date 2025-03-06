import { inject } from "@adonisjs/core";
import { ObjectType, Zone } from "bondage-fantasy-common";
import { Collection, Db, Document, Filter } from "mongodb";
import { escapeRegex } from "../utils.js";

@inject()
export class ZoneDao {
  constructor(private db: Db) {}

  async getById(id: number): Promise<Zone | null> {
    return await this.getCollection().findOne({ id });
  }

  async getByCharacterObject(characterId: number): Promise<Zone | null> {
    return await this.getByCharacterObjectWithProjection(characterId);
  }

  async getZoneIdByCharacterObject(
    characterId: number,
  ): Promise<number | undefined> {
    const zone = await this.getByCharacterObjectWithProjection(characterId, {
      id: 1,
    });
    return zone?.id;
  }

  private async getByCharacterObjectWithProjection(
    characterId: number,
    projection?: Document,
  ): Promise<Zone | null> {
    return await this.getCollection().findOne(
      {
        objects: { $elemMatch: { type: ObjectType.CHARACTER, characterId } },
      },
      { projection },
    );
  }

  async search(params: {
    query: string;
    characterId: number;
    offset: number;
    limit: number;
  }): Promise<{ zones: Zone[]; total: number }> {
    const filters: Filter<Zone>[] = [
      {
        $or: [
          { ownerCharacterId: params.characterId },
          {
            $and: [
              { blacklist: { $ne: params.characterId } },
              {
                $or: [{ private: false }, { whitelist: params.characterId }],
              },
            ],
          },
        ],
      },
    ];
    if (params.query) {
      filters.push({
        name: { $regex: escapeRegex(params.query), $options: "i" },
      });
    }
    const filter: Filter<Zone> = { $and: filters };
    const zones = await this.getCollection()
      .find(filter)
      .skip(params.offset)
      .limit(params.limit)
      .toArray();
    const total = await this.getCollection().countDocuments(filter);
    return { zones, total };
  }

  async isCharacterOwnerOfZone(
    characterId: number,
    zoneId: number,
  ): Promise<boolean> {
    const zone = await this.getCollection().findOne(
      {
        id: zoneId,
        ownerCharacterId: characterId,
      },
      { projection: { _id: 1 } },
    );
    return zone != null;
  }

  async insert(zone: Zone): Promise<void> {
    await this.getCollection().insertOne(zone);
  }

  async update(zone: Zone): Promise<void> {
    await this.getCollection().replaceOne({ id: zone.id }, zone);
  }

  private getCollection(): Collection<Zone> {
    return this.db.collection("zones");
  }
}
