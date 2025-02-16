import {
  Item,
  ItemListRequest,
  ItemListResponse,
  ItemSaveRequest,
  ItemSearchRequest,
  ItemSearchResponse,
  ItemWearRequest,
  SessionData,
} from "bondage-fantasy-common";
import { httpClient } from "./http-client";

class ItemApi {
  async save(json: ItemSaveRequest, image?: File): Promise<Item> {
    const formData = new FormData();
    formData.append("json", JSON.stringify(json));
    if (image) {
      formData.append("image", image);
    }
    return await httpClient.post("items", formData);
  }

  async getById(itemId: number): Promise<Item> {
    return await httpClient.get(`items/${itemId}`);
  }

  async list(request: ItemListRequest): Promise<ItemListResponse> {
    return await httpClient.post("items/list", request);
  }

  async search(request: ItemSearchRequest): Promise<ItemSearchResponse> {
    return await httpClient.post("items/search", request);
  }

  async wear(request: ItemWearRequest): Promise<SessionData> {
    return await httpClient.post("items/wear", request);
  }
}

export const itemApi = new ItemApi();
