import { httpClient } from "./http-client";
import { Character, CharacterCreateRequest } from "bondage-fantasy-common";

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
}

export const characterApi = new CharacterApi();
