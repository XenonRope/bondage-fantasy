import {
  Field,
  FieldConnection,
  Genitals,
  Position,
  Pronouns,
} from "./model.js";

export interface AccountRegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CharacterCreateRequest {
  name: string;
  pronouns: Pronouns;
  genitals: Genitals;
}

export interface ZoneCreateRequest {
  name: string;
  description: string;
  draft: boolean;
  entrance: Position;
  fields: Field[];
  connections: FieldConnection[];
}

export interface ZoneEditRequest {
  zoneId: number;
  name: string;
  description: string;
  draft: boolean;
  entrance: Position;
  fields: Field[];
  connections: FieldConnection[];
}

export interface ZoneSearchRequest {
  query: string;
  offset: number;
  limit: number;
}

export interface ZoneSearchResponse {
  zones: Array<{
    id: number;
    ownerCharacterId: number;
    name: string;
    description: string;
    draft: boolean;
  }>;
  total: number;
}

export interface ZoneJoinRequest {
  zoneId: number;
}

export interface ZoneMoveRequest {
  destination: Position;
}

export interface NpcCreateRequest {
  name: string;
}
