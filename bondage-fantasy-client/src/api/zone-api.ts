import {
  SessionData,
  Zone,
  ZoneInteractWithEventRequest,
  ZoneJoinRequest,
  ZoneMoveRequest,
  ZoneSaveRequest,
  ZoneSearchRequest,
  ZoneSearchResponse,
} from "bondage-fantasy-common";
import { httpClient } from "./http-client";

class ZoneApi {
  async getById(id: number): Promise<Zone> {
    return await httpClient.get(`zones/${id}`);
  }

  async search(request: ZoneSearchRequest): Promise<ZoneSearchResponse> {
    return await httpClient.post("zones/search", request);
  }

  async save(request: ZoneSaveRequest): Promise<SessionData> {
    return await httpClient.post("zones", request);
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

  async interactWithEvent(
    request: ZoneInteractWithEventRequest,
  ): Promise<SessionData> {
    return await httpClient.post("zones/events/interact", request);
  }
}

export const zoneApi = new ZoneApi();
