import { ZoneCharacterDataDao } from "#dao/zone-character-data-dao";
import { inject } from "@adonisjs/core";
import { ZoneCharacterData } from "bondage-fantasy-common";

@inject()
export default class ZoneCharacterDataService {
  constructor(private zoneCharacterDataDao: ZoneCharacterDataDao) {}

  async getOrPrepareEmpty(params: {
    zoneId: number;
    characterId: number;
  }): Promise<ZoneCharacterData> {
    const zoneCharacterData = await this.zoneCharacterDataDao.get(params);
    if (zoneCharacterData != null) {
      return zoneCharacterData;
    }
    return {
      zoneId: params.zoneId,
      characterId: params.characterId,
      variables: {},
    };
  }
}
