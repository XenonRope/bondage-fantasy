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
import router from "@adonisjs/core/services/router";
import { middleware } from "./kernel.js";

router
  .group(() => {
    router.post("/accounts", [AccountController, "register"]);
    router.post("/session/login", [SessionController, "login"]);
    router.get("/csrf/token", () => "");

    router
      .group(() => {
        router.get("/accounts/my", [AccountController, "getMyAccount"]);
        router.get("/characters", [CharacterController, "list"]);
        router.post("/characters", [CharacterController, "create"]);
      })
      .use(middleware.auth());
  })
  .prefix("/api");
