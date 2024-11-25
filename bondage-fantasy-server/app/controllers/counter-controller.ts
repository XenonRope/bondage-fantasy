import { inject } from "@adonisjs/core";
import { Db } from "mongodb";

@inject()
export default class CounterController {
  constructor(private db: Db) {}

  async increment() {
    const result = await this.db
      .collection("counter")
      .findOneAndUpdate({}, { $inc: { value: 1 } }, { upsert: true });

    return {
      value: result?.value,
    };
  }
}
