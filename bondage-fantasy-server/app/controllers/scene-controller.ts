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
import { sessionDataDto } from "./dto.js";
import ZoneCharacterDataService from "#services/zone-character-data-service";
import { ZoneCharacterDataDao } from "#dao/zone-character-data-dao";

@inject()
export default class SceneController {
  constructor(
    private sceneService: SceneService,
    private sessionService: SessionService,
    private characterService: CharacterService,
    private characterDao: CharacterDao,
    private zoneCharacterDataService: ZoneCharacterDataService,
    private zoneCharacterDataDao: ZoneCharacterDataDao,
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
        const zoneCharacterData =
          await this.zoneCharacterDataService.getOrPrepareEmpty({
            zoneId: scene.zoneId,
            characterId,
          });

        const { characterChanged, zoneCharacterDataChanged } =
          await this.sceneService.continueScene({
            scene,
            character,
            zoneCharacterData,
            params: { choiceIndex },
          });

        if (characterChanged) {
          await this.characterDao.update(character);
        }
        if (zoneCharacterDataChanged) {
          await this.zoneCharacterDataDao.update(zoneCharacterData);
        }
        if (this.sceneService.isSceneEnded(scene)) {
          await this.sceneService.deleteById(scene.id);
        } else {
          await this.sceneService.update(scene);
        }

        return sessionDataDto(
          await this.sessionService.getSessionData({
            account: ctx.auth.user?.id,
            characterId,
          }),
        );
      },
    );
  }
}
