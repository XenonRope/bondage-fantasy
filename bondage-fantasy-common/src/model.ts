export interface Account {
  id: number;
  username: string;
  // Not sent to client
  password: string;
}

export enum Pronouns {
  SHE_HER = "SHE_HER",
  HE_HIM = "HE_HIM",
}

export enum Genitals {
  VAGINA = "VAGINA",
  PENIS = "PENIS",
  FUTA = "FUTA",
}

export interface Character {
  id: number;
  // Not sent to client. User shouldn't know that two different characters belong to the same account.
  accountId: number;
  name: string;
  pronouns: Pronouns;
  genitals: Genitals;
}

export interface Position {
  x: number;
  y: number;
}

export interface FieldConnection {
  positions: [Position, Position];
}

export type FieldConnectionKey = string;

export interface Field {
  position: Position;
  name: string;
  description: string;
  canLeave: boolean;
}

export type FieldKey = string;

export interface Zone {
  id: number;
  ownerCharacterId: number;
  name: string;
  description: string;
  entrance: Position;
  fields: Field[];
  connections: FieldConnection[];
}
