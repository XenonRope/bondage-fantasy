export enum SequenceCode {
  ACCOUNT = "ACCOUNT",
  CHARACTER = "CHARACTER",
  ZONE = "ZONE",
  SCENE = "SCENE",
  ITEM = "ITEM",
  IMAGE = "IMAGE",
}

export interface Sequence {
  code: SequenceCode;
  nextValue: number;
}
