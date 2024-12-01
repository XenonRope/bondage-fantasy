import { inject } from "@adonisjs/core";
import { Character } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class CharacterDao {
  constructor(private db: Db) {}

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
