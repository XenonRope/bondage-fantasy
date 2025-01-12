import { SceneService } from "#services/scene-service";
import { SessionService } from "#services/session-service";
import { sceneContinueRequestValidator } from "#validators/scene-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { getCharacterId } from "./utils.js";
import { SessionData } from "bondage-fantasy-common";

@inject()
export default class SceneController {
  constructor(
    private sceneService: SceneService,
    private sessionService: SessionService,
  ) {}

  async continueScene(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);
    const { choiceIndex } = await ctx.request.validateUsing(
      sceneContinueRequestValidator,
    );
    const scene = await this.sceneService.getByCharacterId(characterId);

    await this.sceneService.continueScene(scene, { choiceIndex });
    if (this.sceneService.isSceneEnded(scene)) {
      await this.sceneService.deleteById(scene.id);
    } else {
      await this.sceneService.update(scene);
    }

    return await this.sessionService.getSessionData({
      account: ctx.auth.user?.id,
      characterId,
    });
  }
}
