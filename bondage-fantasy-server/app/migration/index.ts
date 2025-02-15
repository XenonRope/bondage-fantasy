import { MigrationScript } from "#models/migration-model";
import M20241126_CreateIndexes from "./M20241126_CreateIndexes.js";
import M20250201_SetCharacterWearables from "./M20250201_SetCharacterWearables.js";
import M20250201_SetItemType from "./M20250201_SetItemType.js";
import M20250203_SetCharacterInventory from "./M20250203_SetCharacterInventory.js";
import M20250204_ChangeDraftToPrivate from "./M20250204_ChangeDraftToPrivate.js";
import M20250215_SetPause from "./M20250215_SetPause.js";

export const MIGRATION_SCRIPTS: MigrationScript[] = [
  new M20241126_CreateIndexes(),
  new M20250201_SetItemType(),
  new M20250201_SetCharacterWearables(),
  new M20250203_SetCharacterInventory(),
  new M20250204_ChangeDraftToPrivate(),
  new M20250215_SetPause(),
];
