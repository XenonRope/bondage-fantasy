import { inject } from "@adonisjs/core";
import { NpcDao } from "#dao/npc-dao";
import { ZoneService } from "./zone-service.js";
import { Npc } from "bondage-fantasy-common";
import { SequenceService } from "./sequence-service.js";
import { SequenceCode } from "#models/sequence-model";

@inject()
export class NpcService {
  constructor(
    private npcDao: NpcDao,
    private zoneService: ZoneService,
    private sequenceService: SequenceService,
  ) {}

  async create(params: {
    characterId: number;
    zoneId: number;
    name: string;
  }): Promise<Npc> {
    await this.zoneService.assertCharacterIsOwnerOfZone(
      params.characterId,
      params.zoneId,
    );

    const npc: Npc = {
      id: await this.sequenceService.nextSequence(SequenceCode.NPC),
      name: params.name,
      zoneId: params.zoneId,
    };

    await this.npcDao.insert(npc);

    return npc;
  }
}
