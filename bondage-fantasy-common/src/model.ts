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
  draft: boolean;
  entrance: Position;
  fields: Field[];
  connections: FieldConnection[];
}

export enum ObjectType {
  CHARACTER = "CHARACTER",
  NPC = "NPC",
}

export type ZoneObject = CharacterObject | NpcObject;

export interface ZoneObjectBase {
  id: number;
  type: ObjectType;
  zoneId: number;
  position: Position;
}

export interface CharacterObject extends ZoneObjectBase {
  type: ObjectType.CHARACTER;
  characterId: number;
}

export interface NpcObject extends ZoneObjectBase {
  type: ObjectType.NPC;
  npcId: number;
}

export interface ZoneVisionField {
  position: Position;
  name: string;
  canLeave: boolean;
  objects: ZoneVisionObject[];
}

export interface ZoneVisionConnection {
  positions: [Position, Position];
}

export type ZoneVisionObject = CharacterZoneVisionObject | NpcZoneVisionObject;

export interface ZoneVisionObjectBase {
  id: number;
  type: ObjectType;
  position: Position;
}

export interface CharacterZoneVisionObject extends ZoneVisionObjectBase {
  type: ObjectType.CHARACTER;
  characterId: number;
  name: string;
}

export interface NpcZoneVisionObject extends ZoneVisionObjectBase {
  type: ObjectType.NPC;
  npcId: number;
  name: string;
}

export interface ZoneVision {
  currentPosition: Position;
  currentFieldDescription: string;
  entrance: Position;
  fields: ZoneVisionField[];
  connections: ZoneVisionConnection[];
}

export interface SessionData {
  account?: Account;
  character?: Character;
  zone?: ZoneVision;
}

export interface Npc {
  id: number;
  ownerCharacterId: number;
  name: string;
}
