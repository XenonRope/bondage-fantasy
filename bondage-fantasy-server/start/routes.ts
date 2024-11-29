/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AccountController = () => import("#controllers/account-controller");
import router from "@adonisjs/core/services/router";

router
  .group(() => {
    router.post("/accounts/register", [AccountController, "register"]);
  })
  .prefix("/api");
