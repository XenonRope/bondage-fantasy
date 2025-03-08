import { SessionUser } from "#models/session-model";
import drive from "@adonisjs/drive/services/main";
import { test } from "@japa/runner";
import { CHARACTER_ID_HEADER } from "bondage-fantasy-common";
import fs from "node:fs";

test.group("Image delete", async () => {
  test("delete image", async ({ assert, client }) => {
    const fakeDisk = drive.fake();
    const response1 = await client
      .post("/api/images")
      .field("json", JSON.stringify({ name: "My image" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    const response2 = await client
      .delete(`/api/images/${response1.body().id}`)
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.equal(response2.status(), 200);
    assert.isFalse(await fakeDisk.exists(response1.body().imageKey));
  });

  test("error when image doesn't exist", async ({ assert, client }) => {
    const response = await client
      .delete(`/api/images/999999999`)
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    assert.equal(response.status(), 404);
    assert.equal(
      response.body().message,
      "Image 999999999 doesn't exist or you don't have permission to access it",
    );
  });

  test("error when image belongs to another character", async ({
    assert,
    client,
  }) => {
    const fakeDisk = drive.fake();
    const response1 = await client
      .post("/api/images")
      .field("json", JSON.stringify({ name: "My image" }))
      .file("image", fs.createReadStream("tests/resources/small_image.jpg"))
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "1");

    const response2 = await client
      .delete(`/api/images/${response1.body().id}`)
      .withCsrfToken()
      .loginAs(new SessionUser(1))
      .header(CHARACTER_ID_HEADER, "2");

    assert.equal(response2.status(), 404);
    assert.equal(
      response2.body().message,
      `Image ${response1.body().id} doesn't exist or you don't have permission to access it`,
    );
    assert.isTrue(await fakeDisk.exists(response1.body().imageKey));
  });
});
