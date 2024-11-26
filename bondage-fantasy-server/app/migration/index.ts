import { MigrationScript } from "#models/migration-model";
import M20241126_CreateIndexes from "./M20241126_CreateIndexes.js";

export const MIGRATION_SCRIPTS: MigrationScript[] = [
  new M20241126_CreateIndexes(),
];
