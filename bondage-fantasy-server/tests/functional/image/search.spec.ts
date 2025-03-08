import { ImageDao } from "#dao/image-dao";
import { CollectionName } from "#models/collection-model";
import { SessionUser } from "#models/session-model";
import app from "@adonisjs/core/services/app";
import { test } from "@japa/runner";
import { CHARACTER_ID_HEADER } from "bondage-fantasy-common";
import { Db } from "mongodb";

test.group("Image search", (group) => {
  group.setup(async () => {
    const db = await app.container.make(Db);
    await db.collection(CollectionName.IMAGES).deleteMany();
    await createImage({ id: 1, characterId: 1, name: "My image" });
    await createImage({ id: 2, characterId: 1, name: "My image 2" });
    await createImage({ id: 3, characterId: 1, name: "Test" });
    await createImage({ id: 4, characterId: 1, name: "*$.%" });
    await createImage({ id: 5, characterId: 2, name: "My image 3" });
  });

  group.teardown(async () => {
    const db = await app.container.make(Db);
    await db.collection(CollectionName.IMAGES).deleteMany();
  });

  test("empty query", async ({ assert, client }) => {
    const response = await client
      .post("/api/images/search")
      .json({ query: "", offset: 0, limit: 10 })
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.equal(response.body().total, 4);
    assert.equal(response.body().images.length, 4);
    assert.equal(response.body().images[0].name, "My image");
    assert.equal(response.body().images[1].name, "My image 2");
    assert.equal(response.body().images[2].name, "Test");
    assert.equal(response.body().images[3].name, "*$.%");
  });

  test("query with special characters", async ({ assert, client }) => {
    const response = await client
      .post("/api/images/search")
      .json({ query: "$.", offset: 0, limit: 10 })
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.equal(response.body().total, 1);
    assert.equal(response.body().images.length, 1);
    assert.equal(response.body().images[0].name, "*$.%");
  });

  test("query with limit", async ({ assert, client }) => {
    const response = await client
      .post("/api/images/search")
      .json({ query: "", offset: 0, limit: 2 })
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.equal(response.body().total, 4);
    assert.equal(response.body().images.length, 2);
    assert.equal(response.body().images[0].name, "My image");
    assert.equal(response.body().images[1].name, "My image 2");
  });

  test("query with offset", async ({ assert, client }) => {
    const response = await client
      .post("/api/images/search")
      .json({ query: "", offset: 2, limit: 10 })
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.equal(response.body().total, 4);
    assert.equal(response.body().images.length, 2);
    assert.equal(response.body().images[0].name, "Test");
    assert.equal(response.body().images[1].name, "*$.%");
  });

  async function createImage(params: {
    id: number;
    characterId: number;
    name: string;
  }) {
    const imageDao = await app.container.make(ImageDao);
    await imageDao.update({
      id: params.id,
      characterId: params.characterId,
      name: params.name,
      imageKey: `images/${params.id}.jpg`,
      size: 100,
    });
  }
});
