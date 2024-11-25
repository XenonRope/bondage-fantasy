/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const CounterController = () => import("#controllers/counter-controller");
import router from "@adonisjs/core/services/router";

router.get("/", [CounterController, "increment"]);
