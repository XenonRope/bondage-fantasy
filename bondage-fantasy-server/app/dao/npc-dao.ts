import { inject } from "@adonisjs/core";
import { Npc } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class NpcDao {
  constructor(private db: Db) {}

  async getManyByIds(ids: number[]): Promise<Npc[]> {
    return await this.getCollection()
      .find({ id: { $in: ids } })
      .toArray();
  }

  async getManyByCharacterId(characterId: number): Promise<Npc[]> {
    return await this.getCollection()
      .find({ ownerCharacterId: characterId })
      .toArray();
  }

  async getNamesByIds(
    ids: number[],
  ): Promise<Array<{ id: number; name: string }>> {
    return await this.getCollection()
      .find({ id: { $in: ids } }, { projection: { _id: 0, id: 1, name: 1 } })
      .toArray();
  }

  async countByCharacterId(characterId: number): Promise<number> {
    return await this.getCollection().countDocuments({
      ownerCharacterId: characterId,
    });
  }

  async insert(npc: Npc): Promise<void> {
    await this.getCollection().insertOne(npc);
  }

  private getCollection(): Collection<Npc> {
    return this.db.collection("npc");
  }
}
