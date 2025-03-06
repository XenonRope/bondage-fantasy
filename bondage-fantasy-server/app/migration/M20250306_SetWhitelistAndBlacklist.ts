import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";

export default class M20250306_SetWhitelistAndBlacklist
  implements MigrationScript
{
  id = "M20250306_SetWhitelistAndBlacklist";

  async run({ db }: MigrationScriptParams): Promise<void> {
    await db
      .collection("zones")
      .updateMany({}, { $set: { whitelist: [], blacklist: [] } });
  }
}
