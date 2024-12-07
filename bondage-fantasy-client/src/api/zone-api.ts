import { httpClient } from "./http-client";
import {
  Zone,
  ZoneCreateRequest,
  ZoneJoinRequest,
  ZoneSearchRequest,
  ZoneSearchResponse,
  ZoneVision,
} from "bondage-fantasy-common";

class ZoneApi {
  async search(request: ZoneSearchRequest): Promise<ZoneSearchResponse> {
    return await httpClient.post("zones/search", request);
  }

  async create(request: ZoneCreateRequest): Promise<Zone> {
    return await httpClient.post("zones", request);
  }

  async join(request: ZoneJoinRequest): Promise<ZoneVision> {
    return await httpClient.post("zones/join", request);
  }

  async getVision(): Promise<ZoneVision> {
    return await httpClient.get("zones/vision");
  }
}

export const zoneApi = new ZoneApi();
