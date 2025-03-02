import { CharacterDao } from "#dao/character-dao";
import { ItemDao } from "#dao/item-dao";
import { ZoneCharacterDataDao } from "#dao/zone-character-data-dao";
import {
  CharacterNotInSceneException,
  SceneChoiceRequiredException,
  SceneInvalidChoiceException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  Character,
  Expression,
  getCharacterVariables,
  ITEM_IN_INVENTORY_STACK_MAX_COUNT,
  ITEM_IN_INVENTORY_UNIQUE_MAX_COUNT,
  ItemType,
  parseExpression,
  Scene,
  SCENE_EXECUTED_STEPS_MAX_COUNT,
  SceneDefinition,
  ScenePauseMode,
  SceneStepChangeItemsCount,
  SceneStepChoice,
  SceneStepShareItem,
  SceneStepType,
  SceneStepVariable,
  VARIABLE_MAX_COUNT,
  VARIABLE_VALUE_MAX_LENGTH,
  Zone,
  ZoneCharacterData,
} from "bondage-fantasy-common";
import { SceneDao } from "../dao/scene-dao.js";
import CharacterService from "./character-service.js";
import { ExpressionEvaluator } from "./expression-evaluator.js";
import { SequenceService } from "./sequence-service.js";
import { TemplateRenderer } from "./template-renderer.js";
import ZoneCharacterDataService from "./zone-character-data-service.js";

@inject()
export class SceneService {
  constructor(
    private expressionEvaluator: ExpressionEvaluator,
    private sceneDao: SceneDao,
    private sequenceService: SequenceService,
    private itemDao: ItemDao,
    private characterDao: CharacterDao,
    private templateRenderer: TemplateRenderer,
    private zoneCharacterDataService: ZoneCharacterDataService,
    private zoneCharacterDataDao: ZoneCharacterDataDao,
    private characterService: CharacterService,
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
    character: Character;
    zone: Zone;
    definition: SceneDefinition;
  }): Promise<void> {
    const id = await this.sequenceService.nextSequence(SequenceCode.SCENE);
    const scene: Scene = {
      id,
      ownerCharacterId: params.zone.ownerCharacterId,
      characterId: params.character.id,
      zoneId: params.zone.id,
      definition: params.definition,
      currentStep: -1,
      text: "",
      variables: {},
    };
    const zoneCharacterData =
      await this.zoneCharacterDataService.getOrPrepareEmpty({
        zoneId: params.zone.id,
        characterId: params.character.id,
      });

    const { characterChanged, zoneCharacterDataChanged } =
      await this.continueScene(scene, params.character, zoneCharacterData);

    if (characterChanged) {
      await this.characterDao.update(params.character);
    }
    if (zoneCharacterDataChanged) {
      await this.zoneCharacterDataDao.update(zoneCharacterData);
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
    zoneCharacterData: ZoneCharacterData,
    params?: { choiceIndex?: number },
  ): Promise<{
    characterChanged: boolean;
    zoneCharacterDataChanged: boolean;
  }> {
    let characterChanged = false;
    let zoneCharacterDataChanged = false;

    if (this.isSceneEnded(scene)) {
      return { characterChanged, zoneCharacterDataChanged };
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
        return { characterChanged, zoneCharacterDataChanged };
      }

      const step = scene.definition.steps[scene.currentStep];
      if (step.type === SceneStepType.TEXT) {
        scene.textCharacterName = step.characterName;
        scene.textCharacterNameColor = step.characterNameColor;
        scene.text = this.templateRenderer.render(
          step.text,
          this.getVariables(scene, character, zoneCharacterData),
        );

        if (
          step.pause === ScenePauseMode.NEVER ||
          (step.pause === ScenePauseMode.AUTO &&
            scene.definition.steps[scene.currentStep + 1]?.type ===
              SceneStepType.CHOICE)
        ) {
          scene.currentStep++;
          executedStepsCount++;
          continue;
        }

        return { characterChanged, zoneCharacterDataChanged };
      } else if (step.type === SceneStepType.JUMP) {
        if (
          step.condition == null ||
          this.expressionEvaluator.evaluateAsBoolean(
            this.parseExpression(step.condition),
            this.getVariables(scene, character, zoneCharacterData),
          )
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
              this.expressionEvaluator.evaluateAsBoolean(
                this.parseExpression(option.condition),
                this.getVariables(scene, character, zoneCharacterData),
              )
            );
          })
          .map(({ option, index }) => ({
            name: option.name,
            index: index,
          }));
        return { characterChanged, zoneCharacterDataChanged };
      } else if (step.type === SceneStepType.ABORT) {
        this.abort(scene);
        return { characterChanged, zoneCharacterDataChanged };
      } else if (step.type === SceneStepType.VARIABLE) {
        const result = this.setVariable(
          step,
          scene,
          character,
          zoneCharacterData,
        );
        if (result.zoneCharacterDataChanged) {
          zoneCharacterDataChanged = true;
        }
      } else if (step.type === SceneStepType.USE_WEARABLE) {
        const items = await this.itemDao.getManyByIds(step.itemsIds);
        const wearableItems = items
          .filter((wearable) => wearable.type === ItemType.WEARABLE)
          .filter(
            (wearable) => wearable.ownerCharacterId === scene.ownerCharacterId,
          );
        if (
          wearableItems.length !== step.itemsIds.length ||
          !this.characterService.wearItemsOnCharacter(character, wearableItems)
        ) {
          if (step.fallbackLabel == null) {
            scene.currentStep++;
          } else {
            this.jumpToLabel(scene, step.fallbackLabel);
          }
          executedStepsCount++;
          continue;
        }
        characterChanged = true;
      } else if (step.type === SceneStepType.REMOVE_WEARABLE) {
        const removed = this.characterService.removeWearablesFromCharacter(
          character,
          step.slots,
        );
        if (removed) {
          characterChanged = true;
        }
      } else if (step.type === SceneStepType.CHANGE_ITEMS_COUNT) {
        const result = await this.executeStepChangeItemsCount(
          step,
          scene,
          character,
          zoneCharacterData,
        );
        if (result.characterChanged) {
          characterChanged = true;
        }
      } else if (step.type === SceneStepType.SHARE_ITEM) {
        const result = await this.executeStepShareItem(step, scene, character);
        if (result.characterChanged) {
          characterChanged = true;
        }
      }
      scene.currentStep++;
      executedStepsCount++;
    }

    return { characterChanged, zoneCharacterDataChanged };
  }

  private async executeStepChangeItemsCount(
    step: SceneStepChangeItemsCount,
    scene: Scene,
    character: Character,
    zoneCharacterData: ZoneCharacterData,
  ): Promise<{ characterChanged: boolean }> {
    const item = await this.itemDao.getById(step.itemId);
    if (
      item == null ||
      item.ownerCharacterId !== scene.ownerCharacterId ||
      item.type !== ItemType.STORABLE
    ) {
      return { characterChanged: false };
    }
    const delta = this.expressionEvaluator.evaluateAsInteger(
      this.parseExpression(step.delta),
      this.getVariables(scene, character, zoneCharacterData),
    );
    if (Number.isNaN(delta)) {
      return { characterChanged: false };
    }
    let itemInInventory = character.inventory.find(
      ({ itemId }) => itemId === step.itemId,
    );
    if (itemInInventory == null) {
      if (character.inventory.length >= ITEM_IN_INVENTORY_UNIQUE_MAX_COUNT) {
        return { characterChanged: false };
      }
      itemInInventory = {
        itemId: step.itemId,
        name: item.name,
        description: item.description,
        imageKey: item.imageKey,
        count: 0,
      };
      character.inventory.push(itemInInventory);
    } else {
      itemInInventory.name = item.name;
      itemInInventory.description = item.description;
      itemInInventory.imageKey = item.imageKey;
    }
    itemInInventory.count += delta;
    if (itemInInventory.count > ITEM_IN_INVENTORY_STACK_MAX_COUNT) {
      itemInInventory.count = ITEM_IN_INVENTORY_STACK_MAX_COUNT;
    }
    character.inventory = character.inventory.filter(({ count }) => count > 0);

    return { characterChanged: true };
  }

  private async executeStepShareItem(
    step: SceneStepShareItem,
    scene: Scene,
    character: Character,
  ): Promise<{ characterChanged: boolean }> {
    const item = await this.itemDao.getById(step.itemId);
    if (
      item == null ||
      item.ownerCharacterId !== scene.ownerCharacterId ||
      character.sharedItemsIds.includes(item.id) ||
      item.ownerCharacterId === character.id
    ) {
      return { characterChanged: false };
    }
    character.sharedItemsIds.push(item.id);

    return { characterChanged: true };
  }

  private getVariables(
    scene: Scene,
    character: Character,
    zoneCharacterData: ZoneCharacterData,
  ): Record<string, string> {
    return {
      ...getCharacterVariables(character),
      ...zoneCharacterData.variables,
      ...scene.variables,
    };
  }

  private setVariable(
    step: SceneStepVariable,
    scene: Scene,
    character: Character,
    zoneCharacterData: ZoneCharacterData,
  ): { zoneCharacterDataChanged: boolean } {
    const value = this.expressionEvaluator.evaluate(
      this.parseExpression(step.value),
      this.getVariables(scene, character, zoneCharacterData),
    );
    if (value.length > VARIABLE_VALUE_MAX_LENGTH) {
      return { zoneCharacterDataChanged: false };
    }

    const variables = step.global
      ? zoneCharacterData.variables
      : scene.variables;

    if (!value) {
      delete variables[step.name];
      return { zoneCharacterDataChanged: step.global ?? false };
    }

    if (
      Object.keys(variables).length >= VARIABLE_MAX_COUNT &&
      !variables[step.name]
    ) {
      return { zoneCharacterDataChanged: false };
    }

    variables[step.name] = value;
    return { zoneCharacterDataChanged: step.global ?? false };
  }

  private parseExpression(expressionSource: string): Expression {
    const [expression, error] = parseExpression(expressionSource);
    if (error) {
      return "<ERROR>";
    }
    return expression;
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
