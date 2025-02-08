import env from "#start/env";
import { inject } from "@adonisjs/core";
import { AppConfig } from "bondage-fantasy-common";

@inject()
export default class ConfigController {
  async get(): Promise<AppConfig> {
    return {
      filesUrl: env.get("FILES_URL") as string,
    };
  }
}
