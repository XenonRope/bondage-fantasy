import { AppConfig } from "bondage-fantasy-common";
import { configApi } from "../api/config-api";

export class ConfigService {
  private config?: Promise<AppConfig>;

  async getConfig(): Promise<AppConfig> {
    if (!this.config) {
      this.config = configApi.get();
    }
    return await this.config;
  }
}

export const configService = new ConfigService();
