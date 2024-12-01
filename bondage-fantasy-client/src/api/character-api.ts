import { httpClient } from "./http-client";
import { CharacterCreateRequest } from "bondage-fantasy-common";

class CharacterApi {
  async create(request: CharacterCreateRequest): Promise<void> {
    return await httpClient.post("characters", request);
  }
}

export const characterApi = new CharacterApi();
