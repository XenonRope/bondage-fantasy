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
import router from "@adonisjs/core/services/router";
import { middleware } from "./kernel.js";

router
  .group(() => {
    router.post("/accounts", [AccountController, "register"]);
    router.post("/session/login", [SessionController, "login"]);
    router.post("/session/logout", [SessionController, "logout"]);
    router.get("/session", [SessionController, "getSessionData"]);

    router
      .group(() => {
        router.get("/characters", [CharacterController, "list"]);
        router
          .get("/characters/:id", [CharacterController, "getById"])
          .where("id", router.matchers.number());
        router.post("/characters", [CharacterController, "create"]);
        router.post("/zones", [ZoneController, "create"]);
        router.post("/zones/search", [ZoneController, "search"]);
        router.post("/zones/join", [ZoneController, "join"]);
        router.post("/zones/leave", [ZoneController, "leave"]);
      })
      .use(middleware.auth());
  })
  .prefix("/api");
