export enum SequenceCode {
  ACCOUNT = "ACCOUNT",
}

export interface Sequence {
  code: SequenceCode;
  nextValue: number;
}
