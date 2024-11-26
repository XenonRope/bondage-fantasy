import { Sequence, SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import { Collection, Db } from "mongodb";

@inject()
export class SequenceDao {
  constructor(private db: Db) {}

  async incrementNextValue(code: SequenceCode): Promise<Sequence> {
    const sequence = await this.getCollection().findOneAndUpdate(
      { code },
      { $inc: { nextValue: 1 } },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return sequence!;
  }

  private getCollection(): Collection<Sequence> {
    return this.db.collection("sequences");
  }
}
