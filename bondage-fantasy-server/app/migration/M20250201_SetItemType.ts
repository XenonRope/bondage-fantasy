import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";
import { ItemType } from "bondage-fantasy-common";

export default class M20250201_SetItemType implements MigrationScript {
  id = "M20250201_SetItemType";

  async run({ db }: MigrationScriptParams): Promise<void> {
    await db
      .collection("items")
      .updateMany({}, { $set: { type: ItemType.WEARABLE } });
  }
}
