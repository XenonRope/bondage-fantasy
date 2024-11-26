import MigrationService from "#services/migration-service";
import type { ApplicationService } from "@adonisjs/core/types";

export default class MigrationProvider {
  constructor(private app: ApplicationService) {}

  async start() {
    const migrationService = await this.app.container.make(MigrationService);
    await migrationService.runMigrations();
  }
}
