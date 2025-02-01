import { MigrationScript } from "#models/migration-model";
import M20241126_CreateIndexes from "./M20241126_CreateIndexes.js";
import M20250201_SetItemType from "./M20250201_SetItemType.js";

export const MIGRATION_SCRIPTS: MigrationScript[] = [
  new M20241126_CreateIndexes(),
  new M20250201_SetItemType(),
];
