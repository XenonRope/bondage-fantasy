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

export interface ZoneFieldPosition {
  x: number;
  y: number;
}

export interface ZoneFieldConnection {
  positions: [ZoneFieldPosition, ZoneFieldPosition];
}

export interface ZoneField {
  position: ZoneFieldPosition;
  name: string;
  description: string;
}

export interface Zone {
  id: number;
  ownerCharacterId: number;
  name: string;
  description: string;
  fields: ZoneField[];
  connections: ZoneFieldConnection[];
}
