export enum SequenceCode {
  ACCOUNT = "ACCOUNT",
  CHARACTER = "CHARACTER",
  ZONE = "ZONE",
  ZONE_OBJECT = "ZONE_OBJECT",
  NPC = "NPC",
}

export interface Sequence {
  code: SequenceCode;
  nextValue: number;
}
