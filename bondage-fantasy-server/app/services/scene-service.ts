import { ItemDao } from "#dao/item-dao";
import {
  CharacterNotInSceneException,
  SceneChoiceRequiredException,
  SceneInvalidChoiceException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  Character,
  hasDuplicates,
  ItemType,
  Scene,
  SCENE_EXECUTED_STEPS_MAX_COUNT,
  SceneDefinition,
  SceneStepChoice,
  SceneStepType,
  WearableItemOnCharacter,
  Zone,
} from "bondage-fantasy-common";
import { SceneDao } from "../dao/scene-dao.js";
import CharacterService from "./character-service.js";
import { ExpressionEvaluator } from "./expression-evaluator.js";
import { SequenceService } from "./sequence-service.js";
import { CharacterDao } from "#dao/character-dao";

@inject()
export class SceneService {
  constructor(
    private expressionEvaluator: ExpressionEvaluator,
    private sceneDao: SceneDao,
    private sequenceService: SequenceService,
    private itemDao: ItemDao,
    private characterService: CharacterService,
    private characterDao: CharacterDao,
  ) {}

  async getByCharacterId(characterId: number): Promise<Scene> {
    const scene = await this.tryGetByCharacterId(characterId);
    if (scene == null) {
      throw new CharacterNotInSceneException();
    }
    return scene;
  }

  async tryGetByCharacterId(characterId: number): Promise<Scene | undefined> {
    return (await this.sceneDao.getByCharacterId(characterId)) ?? undefined;
  }

  async isCharacterInScene(characterId: number): Promise<boolean> {
    return await this.sceneDao.existsByCharacterId(characterId);
  }

  async create(params: {
    characterId: number;
    zone: Zone;
    definition: SceneDefinition;
  }): Promise<void> {
    const id = await this.sequenceService.nextSequence(SequenceCode.SCENE);
    const scene: Scene = {
      id,
      ownerCharacterId: params.zone.ownerCharacterId,
      characterId: params.characterId,
      zoneId: params.zone.id,
      definition: params.definition,
      currentStep: -1,
      text: "",
      variables: {},
    };
    const character = await this.characterService.getById(params.characterId);

    const { characterChanged } = await this.continueScene(scene, character);

    if (characterChanged) {
      await this.characterDao.update(character);
    }
    if (!this.isSceneEnded(scene)) {
      await this.sceneDao.insert(scene);
    }
  }

  async update(scene: Scene): Promise<void> {
    await this.sceneDao.update(scene);
  }

  async deleteById(sceneId: number): Promise<void> {
    await this.sceneDao.deleteById(sceneId);
  }

  async continueScene(
    scene: Scene,
    character: Character,
    params?: { choiceIndex?: number },
  ): Promise<{
    characterChanged: boolean;
  }> {
    let characterChanged = false;

    if (this.isSceneEnded(scene)) {
      return { characterChanged };
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

    let executedStepsCount = 0;

    while (scene.currentStep < scene.definition.steps.length) {
      if (executedStepsCount >= SCENE_EXECUTED_STEPS_MAX_COUNT) {
        this.abort(scene);
        return { characterChanged };
      }

      const step = scene.definition.steps[scene.currentStep];
      if (step.type === SceneStepType.TEXT) {
        scene.text = step.text;
        return { characterChanged };
      } else if (step.type === SceneStepType.JUMP) {
        if (
          step.condition == null ||
          this.expressionEvaluator.evaluateAsBoolean(step.condition)
        ) {
          this.jumpToLabel(scene, step.label);
          executedStepsCount++;
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
        return { characterChanged };
      } else if (step.type === SceneStepType.ABORT) {
        this.abort(scene);
        return { characterChanged };
      } else if (step.type === SceneStepType.VARIABLE) {
        scene.variables[step.name] = this.expressionEvaluator.evaluate(
          step.value,
        );
      } else if (step.type === SceneStepType.USE_WEARABLE) {
        const wearablesToAdd: WearableItemOnCharacter[] = (
          await this.itemDao.getManyByIds(step.itemsIds)
        )
          .filter((wearable) => wearable.type === ItemType.WEARABLE)
          .filter(
            (wearable) => wearable.ownerCharacterId === scene.ownerCharacterId,
          )
          .map((wearable) => ({
            itemId: wearable.id,
            name: wearable.name,
            description: wearable.description,
            slots: wearable.slots,
          }));
        const slots = wearablesToAdd.flatMap((wearable) => wearable.slots);
        if (
          hasDuplicates(slots) ||
          wearablesToAdd.length !== step.itemsIds.length
        ) {
          if (step.fallbackLabel == null) {
            scene.currentStep++;
          } else {
            this.jumpToLabel(scene, step.fallbackLabel);
          }
          executedStepsCount++;
          continue;
        }
        character.wearables = character.wearables.filter(
          (wearable) => !wearable.slots.some((slot) => slots.includes(slot)),
        );
        character.wearables.push(...wearablesToAdd);
        characterChanged = true;
      } else if (step.type === SceneStepType.REMOVE_WEARABLE) {
        character.wearables = character.wearables.filter((wearable) =>
          wearable.slots.some((slot) => step.slots.includes(slot)),
        );
        characterChanged = true;
      }
      scene.currentStep++;
      executedStepsCount++;
    }

    return { characterChanged };
  }

  private abort(scene: Scene): void {
    scene.currentStep = scene.definition.steps.length;
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

  isSceneEnded(scene: Scene): boolean {
    return scene.currentStep >= scene.definition.steps.length;
  }
}
