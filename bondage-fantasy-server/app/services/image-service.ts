import { ImageDao } from "#dao/image-dao";
import {
  ImageMaxCountExceededException,
  ImageMaxTotalSizeExceededException,
  ImageNotFoundException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import { MultipartFile } from "@adonisjs/core/bodyparser";
import { cuid } from "@adonisjs/core/helpers";
import drive from "@adonisjs/drive/services/main";
import {
  Image,
  IMAGE_MAX_COUNT,
  IMAGE_MAX_TOTAL_SIZE,
} from "bondage-fantasy-common";
import lockService, { LOCKS } from "./lock-service.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export class ImageService {
  constructor(
    private imageDao: ImageDao,
    private sequenceService: SequenceService,
  ) {}

  async save(params: {
    imageId?: number;
    characterId: number;
    name: string;
    file: MultipartFile;
  }): Promise<Image> {
    const locks =
      params.imageId == null
        ? [LOCKS.character(params.characterId)]
        : [LOCKS.character(params.characterId), LOCKS.image(params.imageId)];

    return await lockService.run(locks, "1s", async () => {
      const existingImage =
        params.imageId != null
          ? await this.imageDao.getById(params.imageId)
          : undefined;
      if (
        params.imageId != null &&
        (existingImage == null ||
          existingImage.characterId !== params.characterId)
      ) {
        throw new ImageNotFoundException(params.imageId);
      }

      const totalSize = await this.imageDao.getTotalSizeByCharacterId(
        params.characterId,
      );
      if (
        totalSize + params.file.size - (existingImage?.size ?? 0) >
        IMAGE_MAX_TOTAL_SIZE
      ) {
        throw new ImageMaxTotalSizeExceededException();
      }
      const count = await this.imageDao.countByCharacterId(params.characterId);
      if (params.imageId == null && count >= IMAGE_MAX_COUNT) {
        throw new ImageMaxCountExceededException();
      }

      const imageId =
        params.imageId ??
        (await this.sequenceService.nextSequence(SequenceCode.IMAGE));
      const imageKey = `images/${cuid()}.${params.file.extname}`;

      if (
        existingImage != null &&
        (await drive.use().exists(existingImage.imageKey))
      ) {
        await drive.use().delete(existingImage.imageKey);
      }

      const newImage: Image = {
        id: imageId,
        characterId: params.characterId,
        name: params.name,
        imageKey,
        size: params.file.size,
      };

      await this.imageDao.update(newImage);
      await params.file.moveToDisk(imageKey);

      return newImage;
    });
  }

  async delete(params: {
    imageId: number;
    characterId: number;
  }): Promise<void> {
    const locks = [
      LOCKS.character(params.characterId),
      LOCKS.image(params.imageId),
    ];

    return await lockService.run(locks, "1s", async () => {
      const image = await this.imageDao.getById(params.imageId);
      if (image == null || image.characterId !== params.characterId) {
        throw new ImageNotFoundException(params.imageId);
      }

      if (await drive.use().exists(image.imageKey)) {
        await drive.use().delete(image.imageKey);
      }
      await this.imageDao.delete(params.imageId);
    });
  }
}
