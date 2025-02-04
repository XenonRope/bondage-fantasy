import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";

export default class M20250204_ChangeDraftToPrivate implements MigrationScript {
  id = "M20250204_ChangeDraftToPrivate";

  async run({ db }: MigrationScriptParams): Promise<void> {
    await db
      .collection("zones")
      .updateMany({}, { $rename: { draft: "private" } });
  }
}
