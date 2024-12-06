import { httpClient } from "./http-client";
import {
  Zone,
  ZoneCreateRequest,
  ZoneSearchRequest,
  ZoneSearchResponse,
} from "bondage-fantasy-common";

class ZoneApi {
  async search(request: ZoneSearchRequest): Promise<ZoneSearchResponse> {
    return await httpClient.post("zones/search", request);
  }

  async create(request: ZoneCreateRequest): Promise<Zone> {
    return await httpClient.post("zones", request);
  }
}

export const zoneApi = new ZoneApi();
