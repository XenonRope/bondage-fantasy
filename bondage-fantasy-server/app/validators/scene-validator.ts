import vine from "@vinejs/vine";
import {
  SCENE_CHOICE_OPTION_NAME_MAX_LENGTH,
  SCENE_CHOICE_OPTION_NAME_MIN_LENGTH,
  SCENE_LABEL_MAX_LENGTH,
  SCENE_LABEL_MIN_LENGTH,
  SCENE_TEXT_MAX_LENGTH,
  SCENE_TEXT_MIN_LENGTH,
  SCENE_VARIABLE_NAME_MAX_LENGTH,
  SCENE_VARIABLE_NAME_MIN_LENGTH,
  SceneStepType,
} from "bondage-fantasy-common";
import { expressionSource } from "./expression-validator.js";

export const sceneStepText = vine.object({
  type: vine.literal(SceneStepType.TEXT),
  text: vine
    .string()
    .minLength(SCENE_TEXT_MIN_LENGTH)
    .maxLength(SCENE_TEXT_MAX_LENGTH),
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
  name: vine
    .string()
    .minLength(SCENE_VARIABLE_NAME_MIN_LENGTH)
    .maxLength(SCENE_VARIABLE_NAME_MAX_LENGTH),
  value: expressionSource,
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
]);

export const sceneDefinition = vine.object({
  steps: vine.array(sceneStep),
});
