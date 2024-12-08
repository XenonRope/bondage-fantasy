import { inject } from "@adonisjs/core";
import { Field, FieldConnection, Position, Zone } from "bondage-fantasy-common";
import { Collection, Db, Filter } from "mongodb";
import { escapeRegex } from "../utils.js";

@inject()
export class ZoneDao {
  constructor(private db: Db) {}

  async getById(id: number): Promise<Zone | null> {
    return await this.getCollection().findOne({ id });
  }

  async search(params: {
    query: string;
    offset: number;
    limit: number;
  }): Promise<{ zones: Zone[]; total: number }> {
    const filter: Filter<Zone> = params.query
      ? {
          name: { $regex: escapeRegex(params.query), $options: "i" },
        }
      : {};

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

  async update(
    id: number,
    params: {
      name: string;
      description: string;
      entrance: Position;
      fields: Field[];
      connections: FieldConnection[];
    },
  ): Promise<void> {
    await this.getCollection().updateOne(
      { id },
      {
        $set: {
          name: params.name,
          description: params.description,
          entrance: params.entrance,
          fields: params.fields,
          connections: params.connections,
        },
      },
    );
  }

  private getCollection(): Collection<Zone> {
    return this.db.collection("zones");
  }
}
