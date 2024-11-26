import { MigrationDao } from "#dao/migration-dao";
import { MIGRATION_SCRIPTS } from "#migration/index";
import { MigrationScript } from "#models/migration-model";
import { inject } from "@adonisjs/core";
import logger from "@adonisjs/core/services/logger";
import lock from "@adonisjs/lock/services/main";
import { Db } from "mongodb";

@inject()
export default class MigrationService {
  constructor(
    private migrationDao: MigrationDao,
    private db: Db,
  ) {}

  async runMigrations(): Promise<void> {
    logger.info("Wait for lock 'migration.executeMigrations'");
    await lock.createLock("migration.executeMigrations").run(async () => {
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
