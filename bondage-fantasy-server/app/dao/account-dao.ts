import { CollectionName } from "#models/collection-model";
import { inject } from "@adonisjs/core";
import { Account } from "bondage-fantasy-common";
import { Collection, Db } from "mongodb";

@inject()
export class AccountDao {
  constructor(private db: Db) {}

  async getById(id: number): Promise<Account | null> {
    return await this.getCollection().findOne(
      { id },
      { projection: { password: 0 } },
    );
  }

  async getByUsername(
    username: string,
    params?: { includePassword?: boolean },
  ): Promise<Account | null> {
    return await this.getCollection().findOne(
      { username },
      params?.includePassword ? {} : { projection: { password: 0 } },
    );
  }

  async existsUsername(username: string): Promise<boolean> {
    return (await this.getCollection().countDocuments({ username })) !== 0;
  }

  async insert(account: Account): Promise<void> {
    await this.getCollection().insertOne(account);
  }

  private getCollection(): Collection<Account> {
    return this.db.collection(CollectionName.ACCOUNTS);
  }
}
