import { assert } from "@japa/assert";
import { apiClient } from "@japa/api-client";
import app from "@adonisjs/core/services/app";
import type { Config } from "@japa/runner/types";
import { pluginAdonisJS } from "@japa/plugin-adonisjs";
import testUtils from "@adonisjs/core/services/test_utils";
import { shieldApiClient } from "@adonisjs/shield/plugins/api_client";
import { sessionApiClient } from "@adonisjs/session/plugins/api_client";
import { authApiClient } from "@adonisjs/auth/plugins/api_client";
import { Db } from "mongodb";
import { AccountDao } from "#dao/account-dao";
import { CharacterDao } from "#dao/character-dao";
import { Genitals, Pronouns } from "bondage-fantasy-common";
import drive from "@adonisjs/drive/services/main";

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config["plugins"] = [
  assert(),
  apiClient(),
  pluginAdonisJS(app),
  sessionApiClient(app),
  shieldApiClient(),
  authApiClient(app),
];

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, "setup" | "teardown">> = {
  setup: [
    async () => {
      drive.fake();
    },
    async () => {
      const accountDao = await app.container.make(AccountDao);
      const characterDao = await app.container.make(CharacterDao);
      await accountDao.insert({
        id: 1,
        username: "TestUser1",
        password: "TestPassword",
      });
      await characterDao.insert({
        id: 1,
        accountId: 1,
        name: "TestCharacter1",
        pronouns: Pronouns.SHE_HER,
        genitals: Genitals.VAGINA,
        wearables: [],
        inventory: [],
        sharedItemsIds: [],
      });
      await characterDao.insert({
        id: 2,
        accountId: 1,
        name: "TestCharacter2",
        pronouns: Pronouns.HE_HIM,
        genitals: Genitals.PENIS,
        wearables: [],
        inventory: [],
        sharedItemsIds: [],
      });
    },
  ],
  teardown: [
    async () => {
      const db = await app.container.make(Db);
      const collections = await db.listCollections().toArray();
      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({});
      }
    },
    async () => {
      drive.restore();
    },
  ],
};

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config["configureSuite"] = (suite) => {
  if (["browser", "functional", "e2e"].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start());
  }
};
