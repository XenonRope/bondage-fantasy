import { ExceptionHandler, HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import { ApplicationException } from "./exceptions.js";
import { Exception } from "@adonisjs/core/exceptions";
import { ErrorCode } from "bondage-fantasy-common";

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction;

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof Exception && error.code === "E_UNAUTHORIZED_ACCESS") {
      ctx.response.status(401).send({
        code: ErrorCode.E_UNAUTHORIZED_ACCESS,
        message: "You are not logged in or you don't have permission",
      });
      return;
    }
    if (error instanceof ApplicationException) {
      ctx.response.status(error.status).send({
        code: error.code,
        message: error.message,
      });
      return;
    }

    return super.handle(error, ctx);
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx);
  }
}
