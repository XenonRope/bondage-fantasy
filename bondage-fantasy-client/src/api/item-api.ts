import { httpClient } from "./http-client";
import {
  Item,
  ItemSaveRequest,
  ItemSearchRequest,
  ItemSearchResponse,
} from "bondage-fantasy-common";

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

  async search(request: ItemSearchRequest): Promise<ItemSearchResponse> {
    return await httpClient.post("items/search", request);
  }
}

export const itemApi = new ItemApi();
