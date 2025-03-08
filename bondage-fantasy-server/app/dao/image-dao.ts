import { inject } from "@adonisjs/core";
import { Image } from "bondage-fantasy-common";
import { Collection, Db, Filter } from "mongodb";
import { escapeRegex } from "../utils.js";
import { CollectionName } from "#models/collection-model";

@inject()
export class ImageDao {
  constructor(private db: Db) {}

  async getById(id: number): Promise<Image | null> {
    return await this.getCollection().findOne({ id });
  }

  async countByCharacterId(characterId: number): Promise<number> {
    return await this.getCollection().countDocuments({ characterId });
  }

  async getTotalSizeByCharacterId(characterId: number): Promise<number> {
    const result = await this.getCollection()
      .aggregate([
        { $match: { characterId } },
        { $group: { _id: null, totalSize: { $sum: "$size" } } },
      ])
      .toArray();
    return result[0]?.totalSize ?? 0;
  }

  async search(params: {
    query: string;
    characterId: number;
    offset: number;
    limit: number;
  }): Promise<{ images: Image[]; total: number }> {
    const filter: Filter<Image> = {
      characterId: params.characterId,
      name: { $regex: escapeRegex(params.query), $options: "i" },
    };
    const images = await this.getCollection()
      .find(filter)
      .skip(params.offset)
      .limit(params.limit)
      .toArray();
    const total = await this.getCollection().countDocuments(filter);

    return { images, total };
  }

  async update(image: Image): Promise<void> {
    await this.getCollection().replaceOne(
      {
        id: image.id,
      },
      image,
      { upsert: true },
    );
  }

  async delete(imageId: number): Promise<void> {
    await this.getCollection().deleteOne({ id: imageId });
  }

  private getCollection(): Collection<Image> {
    return this.db.collection(CollectionName.IMAGES);
  }
}
