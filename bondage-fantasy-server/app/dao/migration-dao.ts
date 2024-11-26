import { Migration } from "#models/migration-model";
import { inject } from "@adonisjs/core";
import { Collection, Db } from "mongodb";

@inject()
export class MigrationDao {
  constructor(private db: Db) {}

  async getIds(): Promise<string[]> {
    return await this.getCollection().distinct("id");
  }

  async insert(migration: Migration): Promise<void> {
    await this.getCollection().insertOne(migration);
  }

  private getCollection(): Collection<Migration> {
    return this.db.collection("migrations");
  }
}
