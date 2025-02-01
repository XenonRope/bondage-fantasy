import { CharacterDao } from "#dao/character-dao";
import CharacterService from "#services/character-service";
import lockService, { LOCKS } from "#services/lock-service";
import { SceneService } from "#services/scene-service";
import { SessionService } from "#services/session-service";
import { sceneContinueRequestValidator } from "#validators/scene-validator";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { SessionData } from "bondage-fantasy-common";
import { getCharacterId } from "./utils.js";

@inject()
export default class SceneController {
  constructor(
    private sceneService: SceneService,
    private sessionService: SessionService,
    private characterService: CharacterService,
    private characterDao: CharacterDao,
  ) {}

  async continueScene(ctx: HttpContext): Promise<SessionData> {
    const characterId = await getCharacterId(ctx);
    const { choiceIndex } = await ctx.request.validateUsing(
      sceneContinueRequestValidator,
    );

    return await lockService.run(
      LOCKS.character(characterId),
      "1s",
      async () => {
        const scene = await this.sceneService.getByCharacterId(characterId);
        const character = await this.characterService.getById(characterId);

        const { characterChanged } = await this.sceneService.continueScene(
          scene,
          character,
          { choiceIndex },
        );

        if (characterChanged) {
          await this.characterDao.update(character);
        }
        if (this.sceneService.isSceneEnded(scene)) {
          await this.sceneService.deleteById(scene.id);
        } else {
          await this.sceneService.update(scene);
        }

        return await this.sessionService.getSessionData({
          account: ctx.auth.user?.id,
          characterId,
        });
      },
    );
  }
}
