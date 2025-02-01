import {
  Field,
  FieldConnection,
  Genitals,
  ItemSlot,
  ItemType,
  Position,
  Pronouns,
  ZoneObject,
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

export interface ZoneSaveRequest {
  zoneId?: number;
  name: string;
  description: string;
  draft: boolean;
  entrance: Position;
  fields: Field[];
  connections: FieldConnection[];
  objects: ZoneObject[];
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

export interface ZoneInteractWithEventRequest {
  eventId: number;
}

export interface SceneContinueRequest {
  choiceIndex?: number;
}

export type ItemSaveRequest = {
  itemId?: number;
  name: string;
  description: string;
} & (
  | {
      type: ItemType.STORABLE;
    }
  | {
      type: ItemType.WEARABLE;
      slots: ItemSlot[];
    }
);

export interface ItemSearchRequest {
  query: string;
  offset: number;
  limit: number;
}

export interface ItemSearchResponse {
  items: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  total: number;
}
