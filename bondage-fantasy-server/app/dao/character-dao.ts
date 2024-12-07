import { inject } from "@adonisjs/core";
import { Character } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class CharacterDao {
  constructor(private db: Db) {}

  async getById(id: number): Promise<Character | null> {
    return await this.getCollection().findOne({ id });
  }

  async getNamesByIds(
    ids: number[],
  ): Promise<Array<{ id: number; name: string }>> {
    return await this.getCollection()
      .find({ id: { $in: ids } }, { projection: { _id: 0, id: 1, name: 1 } })
      .toArray();
  }

  async getManyByAccountId(accountId: number): Promise<Character[]> {
    return await this.getCollection().find({ accountId }).toArray();
  }

  async countByAccountId(accountId: number): Promise<number> {
    return await this.getCollection().countDocuments({ accountId });
  }

  async isCharacterdOwnedByAccount(
    characterId: number,
    accountId: number,
  ): Promise<boolean> {
    const count = await this.getCollection().countDocuments({
      id: characterId,
      accountId,
    });
    return count > 0;
  }

  async insert(character: Character): Promise<void> {
    await this.getCollection().insertOne(character);
  }

  private getCollection(): Collection<Character> {
    return this.db.collection("characters");
  }
}
