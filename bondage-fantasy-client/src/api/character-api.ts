import {
  Character,
  CharacterCreateRequest,
  SessionData,
  WearableRemoveRequest,
} from "bondage-fantasy-common";
import { httpClient } from "./http-client";

class CharacterApi {
  async getById(id: number): Promise<Character> {
    return await httpClient.get(`characters/${id}`);
  }

  async list(): Promise<Character[]> {
    return await httpClient.get("characters");
  }

  async create(request: CharacterCreateRequest): Promise<Character> {
    return await httpClient.post("characters", request);
  }

  async removeWearable(request: WearableRemoveRequest): Promise<SessionData> {
    return await httpClient.delete(`characters/wearables`, request);
  }
}

export const characterApi = new CharacterApi();
