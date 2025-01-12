import { httpClient } from "./http-client";
import {
  Item,
  ItemSaveRequest,
  ItemSearchRequest,
  ItemSearchResponse,
} from "bondage-fantasy-common";

class ItemApi {
  async save(request: ItemSaveRequest): Promise<Item> {
    return await httpClient.post("items", request);
  }

  async getById(itemId: number): Promise<Item> {
    return await httpClient.get(`items/${itemId}`);
  }

  async search(request: ItemSearchRequest): Promise<ItemSearchResponse> {
    return await httpClient.post("items/search", request);
  }
}

export const itemApi = new ItemApi();
