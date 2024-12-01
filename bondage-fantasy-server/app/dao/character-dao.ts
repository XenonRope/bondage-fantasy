import { inject } from "@adonisjs/core";
import { Character } from "bondage-fantasy-common";
import { Collection, Db, Filter } from "mongodb";

interface ListParams {
  accountsIds?: number[];
}

@inject()
export class CharacterDao {
  constructor(private db: Db) {}

  async list(params: ListParams): Promise<Character[]> {
    const filter = this.prepareListFilter(params);
    return await this.getCollection().find(filter).toArray();
  }

  private prepareListFilter(params: ListParams): Filter<Character> {
    const filters: Filter<Character>[] = [];
    if (params.accountsIds != null) {
      filters.push({ accountId: { $in: params.accountsIds } });
    }

    return filters.length > 0 ? { $and: filters } : {};
  }

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
