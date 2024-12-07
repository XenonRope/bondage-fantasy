import { MigrationDao } from "#dao/migration-dao";
import { MIGRATION_SCRIPTS } from "#migration/index";
import { MigrationScript } from "#models/migration-model";
import { inject } from "@adonisjs/core";
import logger from "@adonisjs/core/services/logger";
import { Db } from "mongodb";
import lockService, { LOCKS } from "./lock-service.js";

@inject()
export default class MigrationService {
  constructor(
    private migrationDao: MigrationDao,
    private db: Db,
  ) {}

  async runMigrations(): Promise<void> {
    logger.info("Wait for lock 'migration.executeMigrations'");
    await lockService.run(LOCKS.migrations, "5m", async () => {
      logger.info("Start migration...");
      for (const migrationScript of await this.getMigrationScriptsToExecute()) {
        logger.info("[Migration %s] Executing...", migrationScript.id);
        await migrationScript.run({ db: this.db });
        await this.migrationDao.insert({
          id: migrationScript.id,
          executionDate: new Date(),
        });
        logger.info("[Migration %s] Completed", migrationScript.id);
      }
      logger.info("All migrations completed");
    });
  }

  private async getMigrationScriptsToExecute(): Promise<MigrationScript[]> {
    const executedMigrationsIds = await this.migrationDao.getIds();

    return MIGRATION_SCRIPTS.filter(
      (migrationScript) => !executedMigrationsIds.includes(migrationScript.id),
    );
  }
}
