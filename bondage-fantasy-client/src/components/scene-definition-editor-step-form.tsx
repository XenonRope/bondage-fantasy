import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  TextInput,
  ColorInput,
  Button,
  Autocomplete,
  Checkbox,
  ActionIcon,
  MultiSelect,
  Select,
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
  SCENE_TEXT_CHARACTER_NAME_MAX_LENGTH,
  SCENE_TEXT_CHARACTER_NAME_MIN_LENGTH,
  SCENE_TEXT_MAX_LENGTH,
  SCENE_TEXT_MIN_LENGTH,
  SCENE_VARIABLE_NAME_MAX_LENGTH,
  SCENE_VARIABLE_NAME_MIN_LENGTH,
  ScenePauseMode,
  SceneStep,
  SceneStepChangeItemsCount,
  SceneStepChoice,
  SceneStepJump,
  SceneStepLabel,
  SceneStepRemoveWearable,
  SceneStepShareItem,
  SceneStepShowImage,
  SceneStepText,
  SceneStepType,
  SceneStepUseWearable,
  SceneStepVariable,
} from "bondage-fantasy-common";
import { useState } from "react";
import { Translation, useTranslation } from "react-i18next";
import { useItemsQuery } from "../utils/item-utils";
import { DEFAULT_DEBOUNCE } from "../utils/utils";
import { Validators } from "../utils/validators";
import { ExpressionEditor } from "./expression-editor";
import { TextTemplateEditor } from "./text-template-editor";
import { useImagesQuery } from "../utils/image-utils";
import { ImageWithPlaceholder } from "./image-with-placeholder";

function TextStep({
  initialStep,
  onConfirm,
  existingVariables,
  existingCharacterNames,
}: {
  initialStep?: SceneStepText;
  onConfirm: (step: SceneStep) => void;
  existingVariables: string[];
  existingCharacterNames: string[];
}) {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: {
      characterName: initialStep?.characterName ?? "",
      characterNameColor: initialStep?.characterNameColor ?? "#000000",
      text: initialStep?.text ?? "",
      pause: initialStep?.pause ?? ScenePauseMode.AUTO,
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
        pause: values.pause,
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
        <Autocomplete
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
          data={existingCharacterNames}
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
      <Select
        {...form.getInputProps("pause")}
        key={form.key("pause")}
        label={<Translation>{(t) => t("scene.pause")}</Translation>}
        data={Object.values(ScenePauseMode).map((mode) => ({
          value: mode,
          label: t(`scene.pauseMode.${mode}`),
        }))}
        className="mt-2"
      />
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

function ShowImageStep({
  initialStep,
  onConfirm,
}: {
  initialStep?: SceneStepShowImage;
  onConfirm: (step: SceneStep) => void;
}) {
  const [imageSearchValue, setImageSearchValue] = useState("");
  const [imageSearchValueDebounced] = useDebouncedValue(
    imageSearchValue,
    DEFAULT_DEBOUNCE,
  );
  const form = useForm({
    initialValues: {
      imageId: initialStep?.imageId.toString() ?? "",
    },
    validate: {
      imageId: Validators.notEmpty(),
    },
  });
  const images = useImagesQuery(
    {
      query: imageSearchValueDebounced,
      page: 1,
      pageSize: form.getValues().imageId ? 21 : 20,
      includeImagesIds: form.getValues().imageId
        ? [parseInt(form.getValues().imageId)]
        : undefined,
    },
    { keepPreviousData: true },
  );

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.SHOW_IMAGE,
        imageId: parseInt(values.imageId),
      });
    })();
  }

  return (
    <>
      <Select
        {...form.getInputProps("imageId")}
        key={form.key("imageId")}
        label={<Translation>{(t) => t("common.image")}</Translation>}
        searchable
        searchValue={imageSearchValue}
        onSearchChange={setImageSearchValue}
        data={(images.data?.images ?? []).map((image) => ({
          value: image.id.toString(),
          label: image.name,
        }))}
      />
      <div className="mt-4 h-32 w-32">
        <ImageWithPlaceholder
          image={
            form.getValues().imageId
              ? images.data?.images.find(
                  (image) => image.id === parseInt(form.getValues().imageId),
                )?.imageKey
              : undefined
          }
        />
      </div>
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
      global: initialStep?.global ?? false,
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
        global: values.global,
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
      <Checkbox
        {...form.getInputProps("global", { type: "checkbox" })}
        label={<Translation>{(t) => t("scene.variableGlobal")}</Translation>}
        className="mt-4"
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
        <div key={index} className="mb-4 p-4 border border-gray-200 rounded-sm">
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
      includeShared: true,
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
      includeShared: true,
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

function ShareItemStep({
  initialStep,
  onConfirm,
}: {
  initialStep?: SceneStepShareItem;
  onConfirm: (step: SceneStep) => void;
}) {
  const [itemSearchValue, setItemSearchValue] = useState("");
  const [itemSearchValueDebounced] = useDebouncedValue(
    itemSearchValue,
    DEFAULT_DEBOUNCE,
  );
  const form = useForm({
    initialValues: {
      itemId: initialStep?.itemId.toString() ?? "",
    },
    validate: {
      itemId: Validators.notEmpty(),
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
    },
    { keepPreviousData: true },
  );

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.SHARE_ITEM,
        itemId: parseInt(values.itemId),
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
      <Button onClick={handleConfirm} className="mt-4">
        <Translation>{(t) => t("common.confirm")}</Translation>
      </Button>
    </>
  );
}

export function SceneDefinitionEditorStepForm(props: {
  stepType: SceneStepType;
  step?: SceneStep;
  onConfirm: (step: SceneStep) => void;
  existingVariables: string[];
  existingLabels: string[];
  existingCharacterNames: string[];
}) {
  return (
    <>
      {props.stepType === SceneStepType.TEXT ? (
        <TextStep
          initialStep={props.step as SceneStepText}
          onConfirm={props.onConfirm}
          existingVariables={props.existingVariables}
          existingCharacterNames={props.existingCharacterNames}
        />
      ) : props.stepType === SceneStepType.SHOW_IMAGE ? (
        <ShowImageStep
          initialStep={props.step as SceneStepShowImage}
          onConfirm={props.onConfirm}
        />
      ) : props.stepType === SceneStepType.LABEL ? (
        <LabelStep
          initialStep={props.step as SceneStepLabel}
          onConfirm={props.onConfirm}
          existingLabels={props.existingLabels}
        />
      ) : props.stepType === SceneStepType.JUMP ? (
        <JumpStep
          initialStep={props.step as SceneStepJump}
          onConfirm={props.onConfirm}
          existingLabels={props.existingLabels}
          existingVariables={props.existingVariables}
        />
      ) : props.stepType === SceneStepType.VARIABLE ? (
        <VariableStep
          initialStep={props.step as SceneStepVariable}
          onConfirm={props.onConfirm}
          existingVariables={props.existingVariables}
        />
      ) : props.stepType === SceneStepType.CHOICE ? (
        <ChoiceStep
          initialStep={props.step as SceneStepChoice}
          onConfirm={props.onConfirm}
          existingLabels={props.existingLabels}
          existingVariables={props.existingVariables}
        />
      ) : props.stepType === SceneStepType.USE_WEARABLE ? (
        <UseWearableStep
          initialStep={props.step as SceneStepUseWearable}
          onConfirm={props.onConfirm}
          existingLabels={props.existingLabels}
        />
      ) : props.stepType === SceneStepType.REMOVE_WEARABLE ? (
        <RemoveWearableStep
          initialStep={props.step as SceneStepRemoveWearable}
          onConfirm={props.onConfirm}
          existingLabels={props.existingLabels}
        />
      ) : props.stepType === SceneStepType.CHANGE_ITEMS_COUNT ? (
        <ChangeItemsCountStep
          initialStep={props.step as SceneStepChangeItemsCount}
          onConfirm={props.onConfirm}
          existingVariables={props.existingVariables}
        />
      ) : props.stepType === SceneStepType.SHARE_ITEM ? (
        <ShareItemStep
          initialStep={props.step as SceneStepShareItem}
          onConfirm={props.onConfirm}
        />
      ) : null}
    </>
  );
}
