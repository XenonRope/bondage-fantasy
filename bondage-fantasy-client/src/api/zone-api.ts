import { httpClient } from "./http-client";
import { Zone, ZoneCreateRequest } from "bondage-fantasy-common";

class ZoneApi {
  async create(request: ZoneCreateRequest): Promise<Zone> {
    return await httpClient.post("zones", request);
  }
}

export const zoneApi = new ZoneApi();
