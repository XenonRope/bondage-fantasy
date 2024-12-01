export enum SequenceCode {
  ACCOUNT = "ACCOUNT",
  CHARACTER = "CHARACTER",
}

export interface Sequence {
  code: SequenceCode;
  nextValue: number;
}
