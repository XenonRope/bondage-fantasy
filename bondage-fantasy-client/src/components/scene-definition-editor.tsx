import {
  faArrowDown,
  faArrowUp,
  faGear,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Autocomplete,
  Button,
  Checkbox,
  ColorInput,
  Modal,
  MultiSelect,
  Select,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import {
  EXPRESSION_SOURCE_MAX_LENGTH,
  ItemSlot,
  ItemType,
  SCENE_CHOICE_OPTION_NAME_MAX_LENGTH,
  SCENE_CHOICE_OPTION_NAME_MIN_LENGTH,
  SCENE_CHOICE_OPTIONS_MAX_COUNT,
  SCENE_LABEL_MAX_LENGTH,
  SCENE_LABEL_MIN_LENGTH,
  SCENE_STEPS_MAX_COUNT,
  SCENE_TEXT_CHARACTER_NAME_MAX_LENGTH,
  SCENE_TEXT_CHARACTER_NAME_MIN_LENGTH,
  SCENE_TEXT_MAX_LENGTH,
  SCENE_TEXT_MIN_LENGTH,
  SCENE_VARIABLE_NAME_MAX_LENGTH,
  SCENE_VARIABLE_NAME_MIN_LENGTH,
  SceneDefinition,
  SceneStep,
  SceneStepChangeItemsCount,
  SceneStepChoice,
  SceneStepJump,
  SceneStepLabel,
  SceneStepRemoveWearable,
  SceneStepText,
  SceneStepType,
  SceneStepUseWearable,
  SceneStepVariable,
} from "bondage-fantasy-common";
import { useMemo, useState } from "react";
import { Translation, useTranslation } from "react-i18next";
import { useItemsQuery } from "../utils/item-utils";
import { DEFAULT_DEBOUNCE } from "../utils/utils";
import { Validators } from "../utils/validators";
import { ExpressionEditor } from "./expression-editor";
import { TextTemplateEditor } from "./text-template-editor";

function TextStep({
  initialStep,
  onConfirm,
  existingVariables,
}: {
  initialStep?: SceneStepText;
  onConfirm: (step: SceneStep) => void;
  existingVariables: string[];
}) {
  const form = useForm({
    initialValues: {
      characterName: initialStep?.characterName ?? "",
      characterNameColor: initialStep?.characterNameColor ?? "#000000",
      text: initialStep?.text ?? "",
    },
    validate: {
      characterName: Validators.inRange(
        SCENE_TEXT_CHARACTER_NAME_MIN_LENGTH,
        SCENE_TEXT_CHARACTER_NAME_MAX_LENGTH,
      ),
      text: Validators.inRange(SCENE_TEXT_MIN_LENGTH, SCENE_TEXT_MAX_LENGTH),
    },
  });

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.TEXT,
        characterName: values.characterName,
        characterNameColor: values.characterNameColor,
        text: values.text,
      });
    })();
  }

  function fixHexColor() {
    const color = form.getValues().characterNameColor;
    if (color.match(/^#([0-9a-fA-F]{6})$/)) {
      form.setFieldValue("characterNameColor", color.toLowerCase());
      return;
    }
    if (color.match(/^#([0-9a-fA-F]{3,4})$/)) {
      form.setFieldValue(
        "characterNameColor",
        `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase(),
      );
      return;
    }
    form.setFieldValue("characterNameColor", "#000000");
  }

  return (
    <>
      <div className="flex gap-2 items-end">
        <TextInput
          {...form.getInputProps("characterName")}
          key={form.key("characterName")}
          label={<Translation>{(t) => t("common.characterName")}</Translation>}
          maxLength={SCENE_TEXT_CHARACTER_NAME_MAX_LENGTH}
          className="flex-1"
          classNames={{
            input: "text-md font-medium",
          }}
          styles={{
            input: {
              color: form.getValues().characterNameColor,
            },
          }}
        />
        <ColorInput
          {...form.getInputProps("characterNameColor")}
          key={form.key("characterNameColor")}
          format="hex"
          onBlur={fixHexColor}
          disabled={form.getValues().characterName == null}
        />
      </div>
      <TextTemplateEditor
        {...form.getInputProps("text")}
        key={form.key("text")}
        label={<Translation>{(t) => t("scene.text")}</Translation>}
        maxLength={SCENE_TEXT_MAX_LENGTH}
        className="mt-2"
        classNames={{ input: "min-h-14 max-h-52 overflow-auto" }}
        customVariables={existingVariables}
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function LabelStep({
  initialStep,
  onConfirm,
  existingLabels,
}: {
  initialStep?: SceneStepLabel;
  onConfirm: (step: SceneStep) => void;
  existingLabels: string[];
}) {
  const form = useForm({
    initialValues: {
      label: initialStep?.label ?? "",
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
      <Autocomplete
        {...form.getInputProps("label")}
        key={form.key("label")}
        label={<Translation>{(t) => t("scene.label")}</Translation>}
        data={existingLabels}
        maxLength={SCENE_LABEL_MAX_LENGTH}
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function JumpStep({
  initialStep,
  onConfirm,
  existingLabels,
  existingVariables,
}: {
  initialStep?: SceneStepJump;
  onConfirm: (step: SceneStep) => void;
  existingLabels: string[];
  existingVariables: string[];
}) {
  const form = useForm({
    initialValues: {
      label: initialStep?.label ?? "",
      jumpConditionally: initialStep?.condition != null,
      condition: initialStep?.condition ?? "",
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
      <Autocomplete
        {...form.getInputProps("label")}
        key={form.key("label")}
        label={<Translation>{(t) => t("scene.label")}</Translation>}
        data={existingLabels}
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
          label={<Translation>{(t) => t("common.condition")}</Translation>}
          maxLength={EXPRESSION_SOURCE_MAX_LENGTH}
          className="mt-2"
          customVariables={existingVariables}
        />
      )}
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function VariableStep({
  initialStep,
  onConfirm,
  existingVariables,
}: {
  initialStep?: SceneStepVariable;
  onConfirm: (step: SceneStep) => void;
  existingVariables: string[];
}) {
  const form = useForm({
    initialValues: {
      name: initialStep?.name ?? "",
      value: initialStep?.value ?? "",
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
        customVariables={existingVariables}
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function ChoiceStep({
  initialStep,
  onConfirm,
  existingLabels,
  existingVariables,
}: {
  initialStep?: SceneStepChoice;
  onConfirm: (step: SceneStep) => void;
  existingLabels: string[];
  existingVariables: string[];
}) {
  const form = useForm({
    initialValues: {
      options: initialStep?.options.map((option) => ({
        name: option.name ?? "",
        label: option.label ?? "",
        showConditionally: option.condition != null,
        condition: option.condition ?? "",
      })) ?? [{ name: "", label: "", showConditionally: false, condition: "" }],
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
            <Autocomplete
              {...form.getInputProps(`options.${index}.label`)}
              label={
                <Translation>{(t) => t("scene.choiceOptionLabel")}</Translation>
              }
              data={existingLabels}
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
              label={<Translation>{(t) => t("common.condition")}</Translation>}
              maxLength={EXPRESSION_SOURCE_MAX_LENGTH}
              className="mt-2"
              customVariables={existingVariables}
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

function UseWearableStep({
  initialStep,
  onConfirm,
  existingLabels,
}: {
  initialStep?: SceneStepUseWearable;
  onConfirm: (step: SceneStep) => void;
  existingLabels: string[];
}) {
  const [itemSearchValue, setItemSearchValue] = useState("");
  const [itemSearchValueDebounced] = useDebouncedValue(
    itemSearchValue,
    DEFAULT_DEBOUNCE,
  );
  const form = useForm({
    initialValues: {
      itemsIds: initialStep?.itemsIds.map((item) => item.toString()) ?? [],
      fallbackLabel: initialStep?.fallbackLabel ?? "",
    },
    validate: {
      itemsIds: (value) =>
        value.length === 0 ? (
          <Translation>{(t) => t("common.fieldCannotBeEmpty")}</Translation>
        ) : null,
      fallbackLabel: (value) =>
        value
          ? Validators.inRange(
              SCENE_LABEL_MIN_LENGTH,
              SCENE_LABEL_MAX_LENGTH,
            )(value)
          : null,
    },
  });
  const items = useItemsQuery(
    {
      query: itemSearchValueDebounced,
      page: 1,
      pageSize: 20 + form.getValues().itemsIds.length,
      includeItemsIds: form
        .getValues()
        .itemsIds.map((itemId) => parseInt(itemId)),
      types: [ItemType.WEARABLE],
    },
    { keepPreviousData: true },
  );

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.USE_WEARABLE,
        itemsIds: values.itemsIds.map((itemId) => parseInt(itemId)),
        fallbackLabel: values.fallbackLabel || undefined,
      });
    })();
  }

  if (items.data == null) {
    return <></>;
  }

  return (
    <>
      <MultiSelect
        {...form.getInputProps("itemsIds")}
        key={form.key("itemsIds")}
        label={<Translation>{(t) => t("scene.wearables")}</Translation>}
        searchable
        searchValue={itemSearchValue}
        onSearchChange={setItemSearchValue}
        data={items.data?.items.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }))}
        hidePickedOptions
      />
      <Autocomplete
        {...form.getInputProps("fallbackLabel")}
        key={form.key("fallbackLabel")}
        label={<Translation>{(t) => t("scene.fallbackLabel")}</Translation>}
        data={existingLabels}
        maxLength={SCENE_LABEL_MAX_LENGTH}
        className="mt-2"
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function ChangeItemsCountStep({
  initialStep,
  onConfirm,
  existingVariables,
}: {
  initialStep?: SceneStepChangeItemsCount;
  onConfirm: (step: SceneStep) => void;
  existingVariables: string[];
}) {
  const [itemSearchValue, setItemSearchValue] = useState("");
  const [itemSearchValueDebounced] = useDebouncedValue(
    itemSearchValue,
    DEFAULT_DEBOUNCE,
  );
  const form = useForm({
    initialValues: {
      itemId: initialStep?.itemId.toString() ?? "",
      delta: initialStep?.delta ?? "",
    },
    validate: {
      itemId: Validators.notEmpty(),
      delta: Validators.expression(),
    },
  });
  const items = useItemsQuery(
    {
      query: itemSearchValueDebounced,
      page: 1,
      pageSize: form.getValues().itemId ? 21 : 20,
      includeItemsIds: form.getValues().itemId
        ? [parseInt(form.getValues().itemId)]
        : undefined,
      types: [ItemType.STORABLE],
    },
    { keepPreviousData: true },
  );

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.CHANGE_ITEMS_COUNT,
        itemId: parseInt(values.itemId),
        delta: values.delta,
      });
    })();
  }

  if (items.data == null) {
    return <></>;
  }

  return (
    <>
      <Select
        {...form.getInputProps("itemId")}
        key={form.key("itemId")}
        label={<Translation>{(t) => t("common.item")}</Translation>}
        searchable
        searchValue={itemSearchValue}
        onSearchChange={setItemSearchValue}
        data={items.data?.items.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }))}
      />
      <ExpressionEditor
        {...form.getInputProps("delta")}
        key={form.key("delta")}
        label={<Translation>{(t) => t("scene.itemDelta")}</Translation>}
        maxLength={EXPRESSION_SOURCE_MAX_LENGTH}
        className="mt-2"
        customVariables={existingVariables}
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function RemoveWearableStep({
  initialStep,
  onConfirm,
  existingLabels,
}: {
  initialStep?: SceneStepRemoveWearable;
  onConfirm: (step: SceneStep) => void;
  existingLabels: string[];
}) {
  const { t, i18n } = useTranslation();
  const form = useForm({
    initialValues: {
      slots: initialStep?.slots ?? [],
      fallbackLabel: initialStep?.fallbackLabel ?? "",
    },
    validate: {
      slots: (value) =>
        value.length === 0 ? (
          <Translation>{(t) => t("common.fieldCannotBeEmpty")}</Translation>
        ) : null,
      fallbackLabel: (value) =>
        value
          ? Validators.inRange(
              SCENE_LABEL_MIN_LENGTH,
              SCENE_LABEL_MAX_LENGTH,
            )(value)
          : null,
    },
  });

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.REMOVE_WEARABLE,
        slots: values.slots,
        fallbackLabel: values.fallbackLabel || undefined,
      });
    })();
  }

  return (
    <>
      <MultiSelect
        {...form.getInputProps("slots")}
        key={`${form.key("slots")}-${i18n.language}`}
        label={<Translation>{(t) => t("scene.bodyParts")}</Translation>}
        data={Object.values(ItemSlot).map((slot) => ({
          value: slot,
          label: t(`item.slots.${slot}`),
        }))}
      />
      <Autocomplete
        {...form.getInputProps("fallbackLabel")}
        key={form.key("fallbackLabel")}
        label={<Translation>{(t) => t("scene.fallbackLabel")}</Translation>}
        data={existingLabels}
        maxLength={SCENE_LABEL_MAX_LENGTH}
        className="mt-2"
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

export function SceneDefinitionEditor(props: {
  scene: SceneDefinition;
  onChange: (scene: SceneDefinition) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepType, setStepType] = useState<SceneStepType | null>(null);
  const [stepToEdit, setStepToEdit] = useState<SceneStep | null>(null);
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

  function handleAddStepClick(): void {
    if (props.scene.steps.length >= SCENE_STEPS_MAX_COUNT) {
      return;
    }
    setStepType(null);
    setStepToEdit(null);
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
                  onClick={() => handleEditStep(step)}
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
          <TextStep
            initialStep={stepToEdit as SceneStepText}
            onConfirm={handleStepConfirm}
            existingVariables={existingVariables}
          />
        ) : stepType === SceneStepType.LABEL ? (
          <LabelStep
            initialStep={stepToEdit as SceneStepLabel}
            onConfirm={handleStepConfirm}
            existingLabels={existingLabels}
          />
        ) : stepType === SceneStepType.JUMP ? (
          <JumpStep
            initialStep={stepToEdit as SceneStepJump}
            onConfirm={handleStepConfirm}
            existingLabels={existingLabels}
            existingVariables={existingVariables}
          />
        ) : stepType === SceneStepType.VARIABLE ? (
          <VariableStep
            initialStep={stepToEdit as SceneStepVariable}
            onConfirm={handleStepConfirm}
            existingVariables={existingVariables}
          />
        ) : stepType === SceneStepType.CHOICE ? (
          <ChoiceStep
            initialStep={stepToEdit as SceneStepChoice}
            onConfirm={handleStepConfirm}
            existingLabels={existingLabels}
            existingVariables={existingVariables}
          />
        ) : stepType === SceneStepType.USE_WEARABLE ? (
          <UseWearableStep
            initialStep={stepToEdit as SceneStepUseWearable}
            onConfirm={handleStepConfirm}
            existingLabels={existingLabels}
          />
        ) : stepType === SceneStepType.REMOVE_WEARABLE ? (
          <RemoveWearableStep
            initialStep={stepToEdit as SceneStepRemoveWearable}
            onConfirm={handleStepConfirm}
            existingLabels={existingLabels}
          />
        ) : stepType === SceneStepType.CHANGE_ITEMS_COUNT ? (
          <ChangeItemsCountStep
            initialStep={stepToEdit as SceneStepChangeItemsCount}
            onConfirm={handleStepConfirm}
            existingVariables={existingVariables}
          />
        ) : null}
      </Modal>
    </div>
  );
}
