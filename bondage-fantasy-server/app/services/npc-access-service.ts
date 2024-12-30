import { inject } from "@adonisjs/core";
import { Npc } from "bondage-fantasy-common";

@inject()
export class NpcAccessService {
  hasAccessToNpc(params: { characterId: number; npc: Npc }): boolean {
    return params.npc.ownerCharacterId === params.characterId;
  }
}
