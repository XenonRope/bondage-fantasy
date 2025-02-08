/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from "@adonisjs/core/env";

export default await Env.create(new URL("../", import.meta.url), {
  NODE_ENV: Env.schema.enum(["development", "production", "test"] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: "host" }),
  LOG_LEVEL: Env.schema.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
  ]),
  REDIS_HOST: Env.schema.string({ format: "host" }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
  FILES_URL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(["cookie", "memory"] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the lock package
  |----------------------------------------------------------
  */
  LOCK_STORE: Env.schema.enum(["redis", "memory"] as const),

  /*
  |----------------------------------------------------------
  | Application specific configuration
  |----------------------------------------------------------
  */
  MONGODB_CONNECTION_STRING: Env.schema.string(),
  MONGODB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(["fs", "r2"] as const),
  R2_KEY: Env.schema.string(),
  R2_SECRET: Env.schema.string(),
  R2_BUCKET: Env.schema.string(),
  R2_ENDPOINT: Env.schema.string(),
});
