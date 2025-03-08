import { ImageDao } from "#dao/image-dao";
import { SessionUser } from "#models/session-model";
import app from "@adonisjs/core/services/app";
import drive from "@adonisjs/drive/services/main";
import { test } from "@japa/runner";
import { CHARACTER_ID_HEADER } from "bondage-fantasy-common";
import fs from "node:fs";

test.group("Image save", async () => {
  test("create new image", async ({ assert, client }) => {
    const fakeDisk = drive.fake();

    const response = await client
      .post("/api/images")
      .field("json", JSON.stringify({ name: "My image" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.equal(response.status(), 200);
    assert.isNumber(response.body().id);
    assert.equal(response.body().characterId, 1);
    assert.equal(response.body().name, "My image");
    assert.match(response.body().imageKey, /^images\/.*\.jpg$/);
    assert.equal(response.body().size, 1277);
    assert.isTrue(await fakeDisk.exists(response.body().imageKey));
  });

  test("create two images with the same name", async ({ assert, client }) => {
    const fakeDisk = drive.fake();

    const response1 = await client
      .post("/api/images")
      .field("json", JSON.stringify({ name: "Duplicated name" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");
    const response2 = await client
      .post("/api/images")
      .field("json", JSON.stringify({ name: "Duplicated name" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.isTrue(await fakeDisk.exists(response1.body().imageKey));
    assert.isTrue(await fakeDisk.exists(response2.body().imageKey));
  });

  test("update image", async ({ assert, client }) => {
    const fakeDisk = drive.fake();
    const imageDao = await app.container.make(ImageDao);

    const response1 = await client
      .post("/api/images")
      .field("json", JSON.stringify({ name: "First name" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");
    const response2 = await client
      .post("/api/images")
      .field(
        "json",
        JSON.stringify({ imageId: response1.body().id, name: "Second name" }),
      )
      .file("image", fs.createReadStream("tests/resources/small_image.png"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.isFalse(await fakeDisk.exists(response1.body().imageKey));
    assert.isTrue(await fakeDisk.exists(response2.body().imageKey));
    const image = await imageDao.getById(response2.body().id);
    assert.equal(image!.name, "Second name");
    assert.equal(image!.size, 4317);
  });

  test("error when image doesn't exist", async ({ assert, client }) => {
    const response = await client
      .post("/api/images")
      .field("json", JSON.stringify({ imageId: 999999999, name: "My image" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "2");

    assert.equal(response.status(), 404);
    assert.equal(
      response.body().message,
      `Image 999999999 doesn't exist or you don't have permission to access it`,
    );
  });

  test("error when image belongs to another character", async ({
    assert,
    client,
  }) => {
    const response1 = await client
      .post("/api/images")
      .field("json", JSON.stringify({ name: "My image" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    const response2 = await client
      .post("/api/images")
      .field(
        "json",
        JSON.stringify({ imageId: response1.body().id, name: "My image" }),
      )
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "2");

    assert.equal(response2.status(), 404);
    assert.equal(
      response2.body().message,
      `Image ${response1.body().id} doesn't exist or you don't have permission to access it`,
    );
  });
});
