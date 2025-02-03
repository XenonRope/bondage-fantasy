import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";

export default class M20250203_SetCharacterInventory
  implements MigrationScript
{
  id = "M20250203_SetCharacterInventory";

  async run({ db }: MigrationScriptParams): Promise<void> {
    await db
      .collection("characters")
      .updateMany({}, { $set: { inventory: [] } });
  }
}
