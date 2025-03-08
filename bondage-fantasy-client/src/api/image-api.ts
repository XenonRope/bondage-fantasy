import {
  Image,
  ImageSaveRequest,
  ImageSearchRequest,
  ImageSearchResponse,
} from "bondage-fantasy-common";
import { httpClient } from "./http-client";

class ImageApi {
  async save(json: ImageSaveRequest, image: File): Promise<Image> {
    const formData = new FormData();
    formData.append("json", JSON.stringify(json));
    formData.append("image", image);

    return await httpClient.post("images", formData);
  }

  async search(request: ImageSearchRequest): Promise<ImageSearchResponse> {
    return await httpClient.post("images/search", request);
  }

  async delete(id: number): Promise<void> {
    return await httpClient.delete(`images/${id}`);
  }
}

export const imageApi = new ImageApi();
