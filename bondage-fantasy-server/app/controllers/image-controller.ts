import { ImageDao } from "#dao/image-dao";
import { ImageService } from "#services/image-service";
import {
  imageSaveRequestJsonValidator,
  imageSaveRequestValidator,
  imageSearchRequestValidator,
} from "#validators/image-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { Image, ImageSearchResponse } from "bondage-fantasy-common";
import { getCharacterId, safeParseJson } from "./utils.js";

@inject()
export default class ImageController {
  constructor(
    private imageService: ImageService,
    private imageDao: ImageDao,
  ) {}

  async save(ctx: HttpContext): Promise<Image> {
    const { json, image } = await ctx.request.validateUsing(
      imageSaveRequestValidator,
    );
    const request = await imageSaveRequestJsonValidator.validate(
      safeParseJson(json),
    );
    const characterId = await getCharacterId(ctx);

    return await this.imageService.save({
      imageId: request.imageId,
      characterId,
      name: request.name,
      file: image,
    });
  }

  async search(ctx: HttpContext): Promise<ImageSearchResponse> {
    const { query, offset, limit } = await ctx.request.validateUsing(
      imageSearchRequestValidator,
    );
    const characterId = await getCharacterId(ctx);

    const { images, total } = await this.imageDao.search({
      query,
      characterId,
      offset,
      limit,
    });

    return {
      images: images.map((image) => ({
        id: image.id,
        name: image.name,
        imageKey: image.imageKey,
      })),
      total,
    };
  }

  async delete(ctx: HttpContext): Promise<void> {
    const imageId = ctx.request.param("imageId");
    const characterId = await getCharacterId(ctx);

    await this.imageService.delete({ imageId, characterId });
  }
}
