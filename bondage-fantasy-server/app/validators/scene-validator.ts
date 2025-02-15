import vine from "@vinejs/vine";
import {
  ItemSlot,
  SCENE_CHOICE_OPTION_NAME_MAX_LENGTH,
  SCENE_CHOICE_OPTION_NAME_MIN_LENGTH,
  SCENE_LABEL_MAX_LENGTH,
  SCENE_LABEL_MIN_LENGTH,
  SCENE_STEPS_MAX_COUNT,
  SCENE_TEXT_CHARACTER_NAME_MAX_LENGTH,
  SCENE_TEXT_CHARACTER_NAME_MIN_LENGTH,
  SCENE_TEXT_MAX_LENGTH,
  SCENE_TEXT_MIN_LENGTH,
  SCENE_VARIABLE_NAME_MAX_LENGTH,
  SCENE_VARIABLE_NAME_MIN_LENGTH,
  ScenePauseMode,
  SceneStepType,
} from "bondage-fantasy-common";
import { expressionSource } from "./expression-validator.js";

export const sceneStepText = vine.object({
  type: vine.literal(SceneStepType.TEXT),
  characterName: vine
    .string()
    .minLength(SCENE_TEXT_CHARACTER_NAME_MIN_LENGTH)
    .maxLength(SCENE_TEXT_CHARACTER_NAME_MAX_LENGTH)
    .optional(),
  characterNameColor: vine
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/)
    .optional(),
  text: vine
    .string()
    .minLength(SCENE_TEXT_MIN_LENGTH)
    .maxLength(SCENE_TEXT_MAX_LENGTH),
  pause: vine.enum(ScenePauseMode),
});

export const sceneStepLabel = vine.object({
  type: vine.literal(SceneStepType.LABEL),
  label: vine
    .string()
    .minLength(SCENE_LABEL_MIN_LENGTH)
    .maxLength(SCENE_LABEL_MAX_LENGTH),
});

export const sceneStepJump = vine.object({
  type: vine.literal(SceneStepType.JUMP),
  label: vine
    .string()
    .minLength(SCENE_LABEL_MIN_LENGTH)
    .maxLength(SCENE_LABEL_MAX_LENGTH),
  condition: expressionSource.optional(),
});

export const sceneStepChoiceOption = vine.object({
  name: vine
    .string()
    .minLength(SCENE_CHOICE_OPTION_NAME_MIN_LENGTH)
    .maxLength(SCENE_CHOICE_OPTION_NAME_MAX_LENGTH),
  label: vine
    .string()
    .minLength(SCENE_LABEL_MIN_LENGTH)
    .maxLength(SCENE_LABEL_MAX_LENGTH),
  condition: expressionSource.optional(),
});

export const sceneStepChoice = vine.object({
  type: vine.literal(SceneStepType.CHOICE),
  options: vine.array(sceneStepChoiceOption),
});

export const sceneStepAbort = vine.object({
  type: vine.literal(SceneStepType.ABORT),
});

export const sceneStepVariable = vine.object({
  type: vine.literal(SceneStepType.VARIABLE),
  global: vine.boolean().optional(),
  name: vine
    .string()
    .minLength(SCENE_VARIABLE_NAME_MIN_LENGTH)
    .maxLength(SCENE_VARIABLE_NAME_MAX_LENGTH),
  value: expressionSource,
});

export const sceneStepUseWearable = vine.object({
  type: vine.literal(SceneStepType.USE_WEARABLE),
  itemsIds: vine
    .array(vine.number().withoutDecimals())
    .minLength(1)
    .maxLength(Object.keys(ItemSlot).length)
    .distinct(),
  fallbackLabel: vine
    .string()
    .minLength(SCENE_LABEL_MIN_LENGTH)
    .maxLength(SCENE_LABEL_MAX_LENGTH)
    .optional(),
});

export const sceneStepRemoveWearable = vine.object({
  type: vine.literal(SceneStepType.REMOVE_WEARABLE),
  slots: vine.array(vine.enum(ItemSlot)).minLength(1).distinct(),
  fallbackLabel: vine
    .string()
    .minLength(SCENE_LABEL_MIN_LENGTH)
    .maxLength(SCENE_LABEL_MAX_LENGTH)
    .optional(),
});

export const sceneStepChangeItemsCount = vine.object({
  type: vine.literal(SceneStepType.CHANGE_ITEMS_COUNT),
  itemId: vine.number().withoutDecimals(),
  delta: expressionSource,
});

export const sceneStep = vine.union([
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.TEXT,
    sceneStepText,
  ),
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.LABEL,
    sceneStepLabel,
  ),
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.JUMP,
    sceneStepJump,
  ),
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.CHOICE,
    sceneStepChoice,
  ),
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.ABORT,
    sceneStepAbort,
  ),
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.VARIABLE,
    sceneStepVariable,
  ),
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.USE_WEARABLE,
    sceneStepUseWearable,
  ),
  vine.union.if(
    (value) => "type" in value && value.type === SceneStepType.REMOVE_WEARABLE,
    sceneStepRemoveWearable,
  ),
  vine.union.if(
    (value) =>
      "type" in value && value.type === SceneStepType.CHANGE_ITEMS_COUNT,
    sceneStepChangeItemsCount,
  ),
]);

export const sceneDefinition = vine.object({
  steps: vine.array(sceneStep).maxLength(SCENE_STEPS_MAX_COUNT),
});

export const sceneContinueRequestValidator = vine.compile(
  vine.object({
    choiceIndex: vine.number().withoutDecimals().optional(),
  }),
);
