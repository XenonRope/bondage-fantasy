/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AccountController = () => import("#controllers/account-controller");
const SessionController = () => import("#controllers/session-controller");
const CharacterController = () => import("#controllers/character-controller");
const ZoneController = () => import("#controllers/zone-controller");
const SceneController = () => import("#controllers/scene-controller");
const ItemController = () => import("#controllers/item-controller");
const ConfigController = () => import("#controllers/config-controller");
const ImageController = () => import("#controllers/image-controller");
import router from "@adonisjs/core/services/router";
import { middleware } from "./kernel.js";

router
  .group(() => {
    router.post("/accounts", [AccountController, "register"]);
    router.post("/session/login", [SessionController, "login"]);
    router.post("/session/logout", [SessionController, "logout"]);
    router.get("/session", [SessionController, "getSessionData"]);
    router.get("/config", [ConfigController, "get"]);
    router
      .group(() => {
        router.get("/characters", [CharacterController, "list"]);
        router
          .get("/characters/:id", [CharacterController, "getById"])
          .where("id", router.matchers.number());
        router.post("/characters", [CharacterController, "create"]);
        router.delete("/characters/wearables", [
          CharacterController,
          "removeWearable",
        ]);
        router.post("/zones", [ZoneController, "save"]);
        router
          .get("/zones/:id", [ZoneController, "getById"])
          .where("id", router.matchers.number());
        router.post("/zones/search", [ZoneController, "search"]);
        router.post("/zones/join", [ZoneController, "join"]);
        router.post("/zones/leave", [ZoneController, "leave"]);
        router.post("/zones/move", [ZoneController, "move"]);
        router.post("/zones/events/interact", [
          ZoneController,
          "interactWithEvent",
        ]);
        router.post("/scenes/continue", [SceneController, "continueScene"]);
        router.post("/items", [ItemController, "save"]);
        router
          .get("/items/:id", [ItemController, "getById"])
          .where("id", router.matchers.number());
        router.post("/items/list", [ItemController, "list"]);
        router.post("/items/search", [ItemController, "search"]);
        router.post("/items/wear", [ItemController, "wear"]);
        router.post("/images", [ImageController, "save"]);
        router.post("/images/list", [ImageController, "list"]);
        router.post("/images/search", [ImageController, "search"]);
        router
          .delete("/images/:imageId", [ImageController, "delete"])
          .where("imageId", router.matchers.number());
      })
      .use(middleware.auth());
  })
  .prefix("/api");
