import { SceneContinueRequest, SessionData } from "bondage-fantasy-common";
import { httpClient } from "./http-client";

class SceneApi {
  async continueScene(request: SceneContinueRequest): Promise<SessionData> {
    return await httpClient.post("scenes/continue", request);
  }
}

export const sceneApi = new SceneApi();
