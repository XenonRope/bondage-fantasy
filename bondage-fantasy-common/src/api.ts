import {
  Genitals,
  Pronouns,
  ZoneField,
  ZoneFieldConnection,
  ZoneFieldPosition,
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
  entrance: ZoneFieldPosition;
  fields: ZoneField[];
  connections: ZoneFieldConnection[];
}
