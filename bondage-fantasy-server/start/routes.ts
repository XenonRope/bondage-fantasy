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
import router from "@adonisjs/core/services/router";

router
  .group(() => {
    router.post("/accounts/register", [AccountController, "register"]);
    router.post("/session/login", [SessionController, "login"]);
    router.get("/csrf/token", () => "");
  })
  .prefix("/api");
