import { httpClient } from "./http-client";
import { Npc, NpcCreateRequest } from "bondage-fantasy-common";

export class NpcApi {
  async list(): Promise<Npc[]> {
    return await httpClient.get("npc");
  }

  async create(request: NpcCreateRequest): Promise<void> {
    return await httpClient.post("npc", request);
  }
}

export const npcApi = new NpcApi();
