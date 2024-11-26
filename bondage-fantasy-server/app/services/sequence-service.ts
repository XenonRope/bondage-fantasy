import { SequenceDao } from "#dao/sequence-dao";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";

@inject()
export class SequenceService {
  constructor(private sequenceDao: SequenceDao) {}

  async nextSequence(code: SequenceCode): Promise<number> {
    const sequence = await this.sequenceDao.incrementNextValue(code);
    return sequence.nextValue;
  }
}
