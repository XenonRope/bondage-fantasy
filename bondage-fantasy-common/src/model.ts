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
  objects: ZoneObject[];
}

export enum ObjectType {
  CHARACTER = "CHARACTER",
  EVENT = "EVENT",
}

export type ZoneObject = CharacterObject | EventObject;

export interface ZoneObjectBase {
  type: ObjectType;
  position: Position;
}

export interface CharacterObject extends ZoneObjectBase {
  type: ObjectType.CHARACTER;
  characterId: number;
}

export interface EventObject extends ZoneObjectBase {
  type: ObjectType.EVENT;
  eventId: number;
  name: string;
  condition?: ExpressionWithSource;
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

export type ZoneVisionObject =
  | CharacterZoneVisionObject
  | EventZoneVisionObject;

export interface ZoneVisionObjectBase {
  type: ObjectType;
  position: Position;
}

export interface CharacterZoneVisionObject extends ZoneVisionObjectBase {
  type: ObjectType.CHARACTER;
  characterId: number;
  name: string;
}

export interface EventZoneVisionObject extends ZoneVisionObjectBase {
  type: ObjectType.EVENT;
  eventId: number;
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

export type Expression = string | Operation;

export enum Operator {
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN = "LESS_THAN",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  NOT = "NOT",
  AND = "AND",
  OR = "OR",
  XOR = "XOR",
  ADD = "ADD",
  SUBTRACT = "SUBTRACT",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  MODULO = "MODULO",
  CONCATENATE = "CONCATENATE",
  VARIABLE = "VARIABLE",
  INTERPOLATE = "INTERPOLATE",
  IF_ELSE = "IF_ELSE",
}

export interface Operation {
  operator: Operator;
  arguments: Expression[];
}

export interface ExpressionWithSource {
  expression: Expression;
  source: string;
}

export enum SceneStepType {
  FRAME = "FRAME",
  LABEL = "LABEL",
  JUMP = "JUMP",
  CHOICE = "CHOICE",
  ABORT = "ABORT",
  VARIABLE = "VARIABLE",
}

export type SceneStep = SceneStepFrame | SceneStepLabel;

export interface SceneStepFrame {
  type: SceneStepType.FRAME;
  text: string;
}

export interface SceneStepLabel {
  type: SceneStepType.LABEL;
  label: string;
}

export interface SceneStepJump {
  type: SceneStepType.JUMP;
  condition?: Expression;
  label: string;
}

export interface SceneStepChoiceOption {
  name: Expression;
  condition?: Expression;
  label: string;
}

export interface SceneStepChoice {
  type: SceneStepType.CHOICE;
  options: SceneStepChoiceOption[];
}

export interface SceneStepAbort {
  type: SceneStepType.ABORT;
}

export interface SceneStepVariable {
  type: SceneStepType.VARIABLE;
  name: string;
  value: Expression;
}

export interface SceneDefinition {
  steps: SceneStep[];
}
