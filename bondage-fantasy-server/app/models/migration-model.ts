import { Db } from "mongodb";

export interface MigrationScriptParams {
  db: Db;
}

export interface MigrationScript {
  get id(): string;

  run(params: MigrationScriptParams): Promise<void>;
}

export interface Migration {
  id: string;
  executionDate: Date;
}
