import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";

export default class M20241126_CreateIndexes implements MigrationScript {
  id = "M20241126_CreateIndexes";

  async run({ db }: MigrationScriptParams): Promise<void> {
    await db.createIndex("accounts", { username: 1 }, { unique: true });
  }
}
