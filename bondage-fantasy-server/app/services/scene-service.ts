import {
  SceneChoiceRequiredException,
  SceneEndedException,
  SceneInvalidChoiceException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  Scene,
  SceneDefinition,
  SceneStepChoice,
  SceneStepType,
} from "bondage-fantasy-common";
import { SceneDao } from "../dao/scene-dao.js";
import { ExpressionEvaluator } from "./expression-evaluator.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export class SceneService {
  constructor(
    private expressionEvaluator: ExpressionEvaluator,
    private sceneDao: SceneDao,
    private sequenceService: SequenceService,
  ) {}

  async tryGetByCharacterId(characterId: number): Promise<Scene | undefined> {
    return (await this.sceneDao.getByCharacterId(characterId)) ?? undefined;
  }

  async isCharacterInScene(characterId: number): Promise<boolean> {
    return await this.sceneDao.existsByCharacterId(characterId);
  }

  async createScene(params: {
    characterId: number;
    zoneId: number;
    definition: SceneDefinition;
  }): Promise<void> {
    const id = await this.sequenceService.nextSequence(SequenceCode.SCENE);
    const scene: Scene = {
      id,
      characterId: params.characterId,
      zoneId: params.zoneId,
      definition: params.definition,
      currentStep: -1,
      text: "",
      variables: {},
    };
    await this.continueScene(scene);

    await this.sceneDao.insert(scene);
  }

  async continueScene(
    scene: Scene,
    params?: { choiceIndex?: number },
  ): Promise<Scene> {
    if (this.isSceneEnded(scene)) {
      throw new SceneEndedException();
    }

    if (scene.choices != null && scene.choices.length > 0) {
      if (params?.choiceIndex == null) {
        throw new SceneChoiceRequiredException();
      }

      if (
        params.choiceIndex < 0 ||
        params.choiceIndex >= scene.choices.length
      ) {
        throw new SceneInvalidChoiceException();
      }

      const stepChoice = scene.definition.steps[
        scene.currentStep
      ] as SceneStepChoice;
      const chosenOption =
        stepChoice.options[scene.choices[params.choiceIndex].index];
      this.jumpToLabel(scene, chosenOption.label);
      scene.choices = undefined;
    } else {
      scene.currentStep++;
    }

    while (scene.currentStep < scene.definition.steps.length) {
      const step = scene.definition.steps[scene.currentStep];
      if (step.type === SceneStepType.TEXT) {
        scene.text = step.text;
        return scene;
      } else if (step.type === SceneStepType.JUMP) {
        if (
          step.condition == null ||
          this.expressionEvaluator.evaluateAsBoolean(step.condition)
        ) {
          this.jumpToLabel(scene, step.label);
          continue;
        }
      } else if (step.type === SceneStepType.CHOICE) {
        scene.choices = step.options
          .map((option, index) => ({
            option,
            index,
          }))
          .filter(({ option }) => {
            return (
              option.condition == null ||
              this.expressionEvaluator.evaluateAsBoolean(option.condition)
            );
          })
          .map(({ option, index }) => ({
            name: option.name,
            index: index,
          }));
        return scene;
      } else if (step.type === SceneStepType.ABORT) {
        scene.currentStep = scene.definition.steps.length;
        return scene;
      } else if (step.type === SceneStepType.VARIABLE) {
        scene.variables[step.name] = this.expressionEvaluator.evaluate(
          step.value,
        );
      }
      scene.currentStep++;
    }

    return scene;
  }

  private jumpToLabel(scene: Scene, label: string): void {
    const nextStepIndex = this.findStepIndexByLabel(scene, label);
    scene.currentStep =
      nextStepIndex === -1 ? scene.currentStep + 1 : nextStepIndex;
  }

  private findStepIndexByLabel(scene: Scene, label: string): number {
    return scene.definition.steps.findIndex(
      (step) => step.type === SceneStepType.LABEL && step.label === label,
    );
  }

  private isSceneEnded(scene: Scene): boolean {
    return scene.currentStep >= scene.definition.steps.length;
  }
}
