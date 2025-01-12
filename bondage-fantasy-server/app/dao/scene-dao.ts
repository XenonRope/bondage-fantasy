import { inject } from "@adonisjs/core";
import { Collection, Db } from "mongodb";
import { Scene } from "bondage-fantasy-common";

@inject()
export class SceneDao {
  constructor(private db: Db) {}

  async insert(scene: Scene): Promise<void> {
    await this.getCollection().insertOne(scene);
  }

  async getByCharacterId(characterId: number): Promise<Scene | null> {
    return await this.getCollection().findOne({ characterId });
  }

  async existsByCharacterId(characterId: number): Promise<boolean> {
    const scene = await this.getCollection().findOne(
      { characterId },
      { projection: { _id: 1 } },
    );
    return scene != null;
  }

  async deleteById(id: number): Promise<void> {
    await this.getCollection().deleteOne({ id });
  }

  async update(scene: Scene): Promise<void> {
    await this.getCollection().replaceOne({ id: scene.id }, scene);
  }

  private getCollection(): Collection<Scene> {
    return this.db.collection("scenes");
  }
}
