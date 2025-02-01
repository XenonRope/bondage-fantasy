import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";

export default class M20250201_SetCharacterWearables
  implements MigrationScript
{
  id = "M20250201_SetCharacterWearables";

  async run({ db }: MigrationScriptParams): Promise<void> {
    await db
      .collection("characters")
      .updateMany({}, { $set: { wearables: [] } });
  }
}
