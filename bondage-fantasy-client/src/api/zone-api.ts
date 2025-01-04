import { httpClient } from "./http-client";
import {
  SessionData,
  Zone,
  ZoneCreateRequest,
  ZoneEditRequest,
  ZoneJoinRequest,
  ZoneMoveRequest,
  ZoneSearchRequest,
  ZoneSearchResponse,
} from "bondage-fantasy-common";

class ZoneApi {
  async getById(id: number): Promise<Zone> {
    return await httpClient.get(`zones/${id}`);
  }

  async search(request: ZoneSearchRequest): Promise<ZoneSearchResponse> {
    return await httpClient.post("zones/search", request);
  }

  async create(request: ZoneCreateRequest): Promise<Zone> {
    return await httpClient.post("zones", request);
  }

  async edit(request: ZoneEditRequest): Promise<SessionData> {
    return await httpClient.post("zones/edit", request);
  }

  async join(request: ZoneJoinRequest): Promise<SessionData> {
    return await httpClient.post("zones/join", request);
  }

  async leave(): Promise<SessionData> {
    return await httpClient.post("zones/leave", {});
  }

  async move(request: ZoneMoveRequest): Promise<SessionData> {
    return await httpClient.post("zones/move", request);
  }
}

export const zoneApi = new ZoneApi();
