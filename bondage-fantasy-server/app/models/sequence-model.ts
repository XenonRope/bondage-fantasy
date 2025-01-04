export enum SequenceCode {
  ACCOUNT = "ACCOUNT",
  CHARACTER = "CHARACTER",
  ZONE = "ZONE",
}

export interface Sequence {
  code: SequenceCode;
  nextValue: number;
}
