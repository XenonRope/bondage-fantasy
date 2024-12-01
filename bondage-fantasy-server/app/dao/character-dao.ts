import { inject } from "@adonisjs/core";
import { Character } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class CharacterDao {
  constructor(private db: Db) {}

  async countByAccountId(accountId: number): Promise<number> {
    return await this.getCollection().countDocuments({ accountId });
  }

  async insert(character: Character): Promise<void> {
    await this.getCollection().insertOne(character);
  }

  private getCollection(): Collection<Character> {
    return this.db.collection("characters");
  }
}
