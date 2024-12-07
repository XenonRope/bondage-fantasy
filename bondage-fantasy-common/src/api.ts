import {
  Genitals,
  Pronouns,
  Field,
  FieldConnection,
  Position,
  Zone,
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
    name: string;
    description: string;
  }>;
  total: number;
}

export interface ZoneJoinRequest {
  zoneId: number;
}
