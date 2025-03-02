import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";

export default class M20250302_SetSharedItemsIds implements MigrationScript {
  id = "M20250302_SetSharedItemsIds";

  async run({ db }: MigrationScriptParams): Promise<void> {
    await db
      .collection("characters")
      .updateMany({}, { $set: { sharedItemsIds: [] } });
  }
}
