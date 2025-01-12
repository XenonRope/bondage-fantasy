export enum SequenceCode {
  ACCOUNT = "ACCOUNT",
  CHARACTER = "CHARACTER",
  ZONE = "ZONE",
  SCENE = "SCENE",
}

export interface Sequence {
  code: SequenceCode;
  nextValue: number;
}
