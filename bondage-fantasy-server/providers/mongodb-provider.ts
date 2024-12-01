import env from "#start/env";
import type { ApplicationService } from "@adonisjs/core/types";
import { Db, MongoClient } from "mongodb";

export default class MongodbProvider {
  constructor(private app: ApplicationService) {}

  register() {
    const client = new MongoClient(env.get("MONGODB_CONNECTION_STRING"));
    const db = client.db(env.get("MONGODB_DATABASE"));
    this.app.container.bindValue(MongoClient, client);
    this.app.container.bindValue(Db, db);
  }
}
