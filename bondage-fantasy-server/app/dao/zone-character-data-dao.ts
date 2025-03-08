import { CollectionName } from "#models/collection-model";
import { inject } from "@adonisjs/core";
import { ZoneCharacterData } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class ZoneCharacterDataDao {
  constructor(private db: Db) {}

  async get(params: {
    zoneId: number;
    characterId: number;
  }): Promise<ZoneCharacterData | null> {
    return await this.getCollection().findOne({
      zoneId: params.zoneId,
      characterId: params.characterId,
    });
  }

  async update(zoneCharacterData: ZoneCharacterData): Promise<void> {
    await this.getCollection().replaceOne(
      {
        zoneId: zoneCharacterData.zoneId,
        characterId: zoneCharacterData.characterId,
      },
      zoneCharacterData,
      { upsert: true },
    );
  }

  private getCollection(): Collection<ZoneCharacterData> {
    return this.db.collection(CollectionName.ZONE_CHARACTER_DATA);
  }
}
