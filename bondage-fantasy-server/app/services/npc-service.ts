import { NpcDao } from "#dao/npc-dao";
import { NpcLimitReachedException } from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import { Npc, NPC_MAX_COUNT } from "bondage-fantasy-common";
import lockService, { LOCKS } from "./lock-service.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export class NpcService {
  constructor(
    private npcDao: NpcDao,
    private sequenceService: SequenceService,
  ) {}

  async create(params: { characterId: number; name: string }): Promise<void> {
    await lockService.run(
      LOCKS.character(params.characterId),
      "1s",
      async () => {
        const npc: Npc = {
          id: await this.sequenceService.nextSequence(SequenceCode.NPC),
          ownerCharacterId: params.characterId,
          name: params.name,
        };

        const npcCount = await this.npcDao.countByCharacterId(
          params.characterId,
        );
        if (npcCount >= NPC_MAX_COUNT) {
          throw new NpcLimitReachedException();
        }

        await this.npcDao.insert(npc);
      },
    );
  }
}
