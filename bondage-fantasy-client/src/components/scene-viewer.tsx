import { Button } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Scene, SceneContinueRequest } from "bondage-fantasy-common";
import { Translation } from "react-i18next";
import { sceneApi } from "../api/scene-api";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { ImageWithPlaceholder } from "./image-with-placeholder";

export function SceneViewer(props: { scene: Scene }) {
  const continueScene = useMutation({
    mutationFn: async (request: SceneContinueRequest) => {
      const sessionData = await sceneApi.continueScene(request);
      useAppStore.getState().updateSessionData(sessionData);
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  return (
    <div className="p-md">
      {props.scene.imageKey && (
        <div className="mb-8">
          <ImageWithPlaceholder
            image={props.scene.imageKey}
            originalSize={true}
          />
        </div>
      )}
      {props.scene.textCharacterName && (
        <div
          className="text-md font-medium mb-1"
          style={{ color: props.scene.textCharacterNameColor ?? "#000" }}
        >
          {props.scene.textCharacterName}
        </div>
      )}
      <div>{props.scene.text}</div>
      {props.scene.choices && props.scene.choices.length > 0 && (
        <div className="mt-4">
          {props.scene.choices.map((choice, index) => (
            <div key={index}>
              <Button
                onClick={() =>
                  !continueScene.isPending &&
                  continueScene.mutate({ choiceIndex: index })
                }
                variant="transparent"
              >
                {choice.name}
              </Button>
            </div>
          ))}
        </div>
      )}
      {(props.scene.choices == null || props.scene.choices.length === 0) && (
        <Button
          onClick={() => continueScene.mutate({})}
          className="mt-4"
          variant="transparent"
        >
          <Translation>{(t) => t("explore.scene.next")}</Translation>
        </Button>
      )}
    </div>
  );
}
