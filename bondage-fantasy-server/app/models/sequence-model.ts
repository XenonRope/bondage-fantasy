export enum SequenceCode {
  ACCOUNT = "ACCOUNT",
  CHARACTER = "CHARACTER",
  ZONE = "ZONE",
  ZONE_OBJECT = "ZONE_OBJECT",
}

export interface Sequence {
  code: SequenceCode;
  nextValue: number;
}
