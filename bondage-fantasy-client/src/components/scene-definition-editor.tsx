import { Button, Modal, SimpleGrid } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  SCENE_STEPS_MAX_COUNT,
  SceneDefinition,
  SceneStep,
  SceneStepType,
} from "bondage-fantasy-common";
import { useMemo, useState } from "react";
import { Translation } from "react-i18next";
import { itemApi } from "../api/item-api";
import { SceneDefinitionEditorStepForm } from "./scene-definition-editor-step-form";
import { SceneDefinitionEditorStepTile } from "./scene-definition-editor-step-tile";

export function SceneDefinitionEditor(props: {
  scene: SceneDefinition;
  onChange: (scene: SceneDefinition) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepType, setStepType] = useState<SceneStepType>();
  const [stepToEdit, setStepToEdit] = useState<SceneStep>();
  const existingLabels = useMemo(
    () =>
      Array.from(
        new Set(
          props.scene.steps
            .flatMap((step) => {
              if (
                step.type === SceneStepType.LABEL ||
                step.type === SceneStepType.JUMP
              ) {
                return [step.label];
              }
              if (step.type === SceneStepType.CHOICE) {
                return step.options.map((option) => option.label);
              }
              if (
                step.type === SceneStepType.USE_WEARABLE ||
                step.type === SceneStepType.REMOVE_WEARABLE
              ) {
                return step.fallbackLabel ? [step.fallbackLabel] : [];
              }
              return [];
            })
            .filter((label) => label?.length > 0),
        ),
      ),
    [props.scene.steps],
  );
  const existingVariables = useMemo(() => {
    return Array.from(
      new Set(
        props.scene.steps
          .filter((step) => step.type === SceneStepType.VARIABLE)
          .map((step) => step.name),
      ),
    );
  }, [props.scene.steps]);
  const itemsIds = useMemo(() => {
    return Array.from(
      new Set(
        props.scene.steps.flatMap((step) => {
          if (step.type === SceneStepType.USE_WEARABLE) {
            return step.itemsIds;
          }
          if (step.type === SceneStepType.CHANGE_ITEMS_COUNT) {
            return [step.itemId];
          }
          return [];
        }),
      ),
    ).sort((a, b) => a - b);
  }, [props.scene.steps]);
  const items = useQuery({
    queryKey: ["items", { itemsIds, fields: ["id", "name"] }],
    queryFn: async () => {
      if (itemsIds.length === 0) {
        return { items: [] };
      }
      return itemApi.list({ itemsIds, fields: ["id", "name"] });
    },
    placeholderData: keepPreviousData,
  });

  function handleAddStepClick(): void {
    if (props.scene.steps.length >= SCENE_STEPS_MAX_COUNT) {
      return;
    }
    setStepType(undefined);
    setStepToEdit(undefined);
    setDialogOpen(true);
  }

  function handleAddStepDialogClose(): void {
    setDialogOpen(false);
  }

  function handleStepTypeSelect(type: SceneStepType): void {
    if (type === SceneStepType.ABORT) {
      handleStepConfirm({ type: SceneStepType.ABORT });
    } else {
      setStepType(type);
    }
  }

  function handleStepConfirm(step: SceneStep): void {
    if (stepToEdit != null) {
      const newSteps = [...props.scene.steps];
      newSteps[newSteps.indexOf(stepToEdit)] = step;
      props.onChange({ ...props.scene, steps: newSteps });
    } else {
      props.onChange({ ...props.scene, steps: [...props.scene.steps, step] });
    }
    setDialogOpen(false);
  }

  function handleRemoveStep(index: number): void {
    const newSteps = [...props.scene.steps];
    newSteps.splice(index, 1);
    props.onChange({ ...props.scene, steps: newSteps });
  }

  function handleMoveStepUp(index: number): void {
    if (index <= 0) {
      return;
    }
    const newSteps = [...props.scene.steps];
    [newSteps[index - 1], newSteps[index]] = [
      newSteps[index],
      newSteps[index - 1],
    ];
    props.onChange({ ...props.scene, steps: newSteps });
  }

  function handleMoveStepDown(index: number): void {
    if (index >= props.scene.steps.length - 1) {
      return;
    }
    const newSteps = [...props.scene.steps];
    [newSteps[index], newSteps[index + 1]] = [
      newSteps[index + 1],
      newSteps[index],
    ];
    props.onChange({ ...props.scene, steps: newSteps });
  }

  function handleEditStep(step: SceneStep): void {
    setStepType(step.type);
    setStepToEdit(step);
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="text-sm font-medium mb-2">
        <Translation>{(t) => t("common.scene")}</Translation>
      </div>
      <div>
        <div className="flex flex-col gap-2 max-w-xl">
          {props.scene.steps.map((step, index) => (
            <SceneDefinitionEditorStepTile
              key={index}
              step={step}
              items={items.data?.items ?? []}
              onMoveUp={index > 0 ? () => handleMoveStepUp(index) : undefined}
              onMoveDown={
                index < props.scene.steps.length - 1
                  ? () => handleMoveStepDown(index)
                  : undefined
              }
              onEdit={() => handleEditStep(step)}
              onRemove={() => handleRemoveStep(index)}
            />
          ))}
        </div>
        <div
          className={`flex gap-4 ${props.scene.steps.length > 0 ? "mt-4" : ""}`}
        >
          <Button
            onClick={handleAddStepClick}
            disabled={props.scene.steps.length >= SCENE_STEPS_MAX_COUNT}
          >
            <Translation>{(t) => t("scene.addStep")}</Translation>
          </Button>
        </div>
      </div>

      <Modal
        opened={dialogOpen}
        onClose={handleAddStepDialogClose}
        title={
          stepType ? (
            <Translation>
              {(t) =>
                t("scene.stepTitle", { stepType: t(`scene.type.${stepType}`) })
              }
            </Translation>
          ) : (
            <Translation>{(t) => t("scene.addStep")}</Translation>
          )
        }
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
        transitionProps={{ transition: "fade" }}
      >
        {stepType == null ? (
          <SimpleGrid cols={3}>
            {Object.values(SceneStepType).map((stepType) => (
              <Button
                key={stepType}
                onClick={() => handleStepTypeSelect(stepType)}
              >
                <Translation>{(t) => t(`scene.type.${stepType}`)}</Translation>
              </Button>
            ))}
          </SimpleGrid>
        ) : (
          <SceneDefinitionEditorStepForm
            stepType={stepType}
            step={stepToEdit}
            onConfirm={handleStepConfirm}
            existingVariables={existingVariables}
            existingLabels={existingLabels}
          />
        )}
      </Modal>
    </div>
  );
}
