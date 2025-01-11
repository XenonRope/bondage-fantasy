import {
  faArrowDown,
  faArrowUp,
  faGear,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  Checkbox,
  Modal,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  EXPRESSION_SOURCE_MAX_LENGTH,
  SCENE_CHOICE_OPTION_NAME_MAX_LENGTH,
  SCENE_CHOICE_OPTION_NAME_MIN_LENGTH,
  SCENE_CHOICE_OPTIONS_MAX_COUNT,
  SCENE_LABEL_MAX_LENGTH,
  SCENE_LABEL_MIN_LENGTH,
  SCENE_TEXT_MAX_LENGTH,
  SCENE_TEXT_MIN_LENGTH,
  SCENE_VARIABLE_NAME_MAX_LENGTH,
  SCENE_VARIABLE_NAME_MIN_LENGTH,
  SceneDefinition,
  SceneStep,
  SceneStepType,
} from "bondage-fantasy-common";
import { useState } from "react";
import { Validators } from "../utils/validators";
import { ExpressionEditor } from "./expression-editor";
import { TextTemplateEditor } from "./text-template-editor";
import { Translation } from "react-i18next";

function TextStep({ onConfirm }: { onConfirm: (step: SceneStep) => void }) {
  const form = useForm({
    initialValues: {
      text: "",
    },
    validate: {
      text: Validators.inRange(SCENE_TEXT_MIN_LENGTH, SCENE_TEXT_MAX_LENGTH),
    },
  });

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({ type: SceneStepType.TEXT, text: values.text });
    })();
  }

  return (
    <>
      <TextTemplateEditor
        {...form.getInputProps("text")}
        key={form.key("text")}
        label={<Translation>{(t) => t("scene.text")}</Translation>}
        maxLength={SCENE_TEXT_MAX_LENGTH}
        classNames={{ input: "min-h-14 max-h-52 overflow-auto" }}
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function LabelStep({ onConfirm }: { onConfirm: (step: SceneStep) => void }) {
  const form = useForm({
    initialValues: {
      label: "",
    },
    validate: {
      label: Validators.inRange(SCENE_LABEL_MIN_LENGTH, SCENE_LABEL_MAX_LENGTH),
    },
  });

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.LABEL,
        label: values.label,
      });
    })();
  }

  return (
    <>
      <TextInput
        {...form.getInputProps("label")}
        key={form.key("label")}
        label={<Translation>{(t) => t("scene.label")}</Translation>}
        maxLength={SCENE_LABEL_MAX_LENGTH}
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function JumpStep({ onConfirm }: { onConfirm: (step: SceneStep) => void }) {
  const form = useForm({
    initialValues: {
      label: "",
      jumpConditionally: false,
      condition: "",
    },
    validate: {
      label: Validators.inRange(SCENE_LABEL_MIN_LENGTH, SCENE_LABEL_MAX_LENGTH),
      condition: (value, values) =>
        values.jumpConditionally ? Validators.expression()(value) : null,
    },
  });

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.JUMP,
        label: values.label,
        condition: values.jumpConditionally ? values.condition : undefined,
      });
    })();
  }

  return (
    <>
      <TextInput
        {...form.getInputProps("label")}
        key={form.key("label")}
        label={<Translation>{(t) => t("scene.label")}</Translation>}
        maxLength={SCENE_LABEL_MAX_LENGTH}
      />
      <Checkbox
        {...form.getInputProps("jumpConditionally", { type: "checkbox" })}
        key={form.key("jumpConditionally")}
        label={<Translation>{(t) => t("scene.jumpConditionally")}</Translation>}
        className="mt-4"
      />
      {form.getValues().jumpConditionally && (
        <ExpressionEditor
          {...form.getInputProps("condition")}
          key={form.key("condition")}
          label={<Translation>{(t) => t("scene.condition")}</Translation>}
          maxLength={EXPRESSION_SOURCE_MAX_LENGTH}
          className="mt-2"
        />
      )}
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function VariableStep({ onConfirm }: { onConfirm: (step: SceneStep) => void }) {
  const form = useForm({
    initialValues: {
      name: "",
      value: "",
    },
    validate: {
      name: Validators.inRange(
        SCENE_VARIABLE_NAME_MIN_LENGTH,
        SCENE_VARIABLE_NAME_MAX_LENGTH,
      ),
      value: Validators.expression(),
    },
  });

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.VARIABLE,
        name: values.name,
        value: values.value,
      });
    })();
  }

  return (
    <>
      <TextInput
        {...form.getInputProps("name")}
        label={<Translation>{(t) => t("scene.variableName")}</Translation>}
        maxLength={SCENE_VARIABLE_NAME_MAX_LENGTH}
      />
      <ExpressionEditor
        {...form.getInputProps("value")}
        label={<Translation>{(t) => t("scene.variableValue")}</Translation>}
        maxLength={EXPRESSION_SOURCE_MAX_LENGTH}
        className="mt-2"
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function ChoiceStep({ onConfirm }: { onConfirm: (step: SceneStep) => void }) {
  const form = useForm({
    initialValues: {
      options: [
        {
          name: "",
          label: "",
          showConditionally: false,
          condition: "",
        },
      ],
    },
    validate: {
      options: {
        name: Validators.inRange(
          SCENE_CHOICE_OPTION_NAME_MIN_LENGTH,
          SCENE_CHOICE_OPTION_NAME_MAX_LENGTH,
        ),
        label: Validators.inRange(
          SCENE_LABEL_MIN_LENGTH,
          SCENE_LABEL_MAX_LENGTH,
        ),
        condition: (value, values, path) => {
          const option = values.options[parseInt(path.split(".")[1])];
          return option.showConditionally
            ? Validators.expression()(value)
            : null;
        },
      },
    },
  });

  function handleAddOption() {
    form.setFieldValue("options", [
      ...form.getValues().options,
      { name: "", label: "", showConditionally: false, condition: "" },
    ]);
  }

  function handleRemoveOption(index: number) {
    const options = form.getValues().options;
    options.splice(index, 1);
    form.setFieldValue("options", options);
  }

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.CHOICE,
        options: values.options.map((option) => ({
          name: option.name,
          label: option.label,
          condition: option.showConditionally ? option.condition : undefined,
        })),
      });
    })();
  }

  return (
    <>
      {form.getValues().options.map((_option, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
          <div className="flex items-center">
            <TextInput
              {...form.getInputProps(`options.${index}.name`)}
              label={
                <Translation>{(t) => t("scene.choiceOptionName")}</Translation>
              }
              maxLength={SCENE_CHOICE_OPTION_NAME_MAX_LENGTH}
            />
            <TextInput
              {...form.getInputProps(`options.${index}.label`)}
              label={
                <Translation>{(t) => t("scene.choiceOptionLabel")}</Translation>
              }
              maxLength={SCENE_LABEL_MAX_LENGTH}
              className="ml-2"
            />
            {form.getValues().options.length > 1 && (
              <ActionIcon
                variant="transparent"
                data-variant-color="danger"
                onClick={() => handleRemoveOption(index)}
                className="ml-2 self-end mb-1"
              >
                <FontAwesomeIcon icon={faTrash} />
              </ActionIcon>
            )}
          </div>

          <Checkbox
            {...form.getInputProps(`options.${index}.showConditionally`, {
              type: "checkbox",
            })}
            label={
              <Translation>
                {(t) => t("scene.choiceOptionShowConditionally")}
              </Translation>
            }
            className="mt-4"
          />

          {form.getValues().options[index].showConditionally && (
            <ExpressionEditor
              {...form.getInputProps(`options.${index}.condition`)}
              label={<Translation>{(t) => t("scene.condition")}</Translation>}
              maxLength={EXPRESSION_SOURCE_MAX_LENGTH}
              className="mt-2"
            />
          )}
        </div>
      ))}

      <div>
        <Button
          onClick={handleAddOption}
          disabled={
            form.getValues().options.length >= SCENE_CHOICE_OPTIONS_MAX_COUNT
          }
        >
          <Translation>{(t) => t("scene.addChoiceOption")}</Translation>
        </Button>
      </div>
      <div className="mt-4">
        <Button onClick={handleConfirm}>
          <Translation>{(t) => t("common.confirm")}</Translation>
        </Button>
      </div>
    </>
  );
}

export function SceneDefinitionEditor(props: {
  scene: SceneDefinition;
  onChange: (scene: SceneDefinition) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepType, setStepType] = useState<SceneStepType | null>(null);

  function handleAddStepClick(): void {
    setStepType(null);
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
    props.onChange({ ...props.scene, steps: [...props.scene.steps, step] });
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

  return (
    <div>
      <div className="text-sm font-medium mb-2">Scene</div>
      <div>
        <div className="flex flex-col gap-2 max-w-lg">
          {props.scene.steps.map((step, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 border border-black"
            >
              <div>{step.type}</div>
              <div className="flex items-center ml-auto">
                <ActionIcon
                  variant="transparent"
                  onClick={() => handleMoveStepUp(index)}
                  disabled={index === 0}
                >
                  <FontAwesomeIcon icon={faArrowUp} />
                </ActionIcon>
                <ActionIcon
                  variant="transparent"
                  onClick={() => handleMoveStepDown(index)}
                  disabled={index === props.scene.steps.length - 1}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </ActionIcon>
                <ActionIcon
                  variant="transparent"
                  onClick={() => {}}
                  disabled={step.type === SceneStepType.ABORT}
                >
                  <FontAwesomeIcon icon={faGear} />
                </ActionIcon>
                <ActionIcon
                  variant="transparent"
                  data-variant-color="danger"
                  onClick={() => handleRemoveStep(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </ActionIcon>
              </div>
            </div>
          ))}
        </div>
        <div
          className={`flex gap-4 ${props.scene.steps.length > 0 ? "mt-4" : ""}`}
        >
          <Button onClick={handleAddStepClick}>
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
      >
        {stepType === null ? (
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
        ) : stepType === SceneStepType.TEXT ? (
          <TextStep onConfirm={handleStepConfirm} />
        ) : stepType === SceneStepType.LABEL ? (
          <LabelStep onConfirm={handleStepConfirm} />
        ) : stepType === SceneStepType.JUMP ? (
          <JumpStep onConfirm={handleStepConfirm} />
        ) : stepType === SceneStepType.VARIABLE ? (
          <VariableStep onConfirm={handleStepConfirm} />
        ) : stepType === SceneStepType.CHOICE ? (
          <ChoiceStep onConfirm={handleStepConfirm} />
        ) : null}
      </Modal>
    </div>
  );
}
