import { AppConfig } from "bondage-fantasy-common";
import { httpClient } from "./http-client";

class ConfigApi {
  async get(): Promise<AppConfig> {
    return await httpClient.get("config", {
      doNotWaitForSessionInitialization: true,
    });
  }
}

export const configApi = new ConfigApi();
