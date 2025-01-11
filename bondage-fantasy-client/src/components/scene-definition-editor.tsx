import { Button, Modal, SimpleGrid, TextInput } from "@mantine/core";
import {
  SCENE_FRAME_TEXT_MAX_LENGTH,
  SCENE_LABEL_MAX_LENGTH,
  SceneDefinition,
  SceneStep,
  SceneStepType,
} from "bondage-fantasy-common";
import { useState } from "react";
import { TextTemplateEditor } from "./text-template-editor";
import { useForm } from "@mantine/form";
import { Validators } from "../utils/validators";

function TextStep({ onConfirm }: { onConfirm: (step: SceneStep) => void }) {
  const form = useForm({
    initialValues: {
      text: "",
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
        label="Text"
        maxLength={SCENE_FRAME_TEXT_MAX_LENGTH}
        className="mt-2"
        classNames={{ input: "min-h-14 max-h-52 overflow-auto" }}
      />
      <Button onClick={handleConfirm} className="mt-4">
        Confirm
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
      label: Validators.notEmpty(),
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
        label="Label"
        maxLength={SCENE_LABEL_MAX_LENGTH}
      />
      <Button onClick={handleConfirm} className="mt-4">
        Confirm
      </Button>
    </>
  );
}

function JumpStep({ onConfirm }: { onConfirm: (step: SceneStep) => void }) {
  const form = useForm({
    initialValues: {
      label: "",
    },
    validate: {
      label: Validators.notEmpty(),
    },
  });

  function handleConfirm() {
    form.onSubmit((values) => {
      onConfirm({
        type: SceneStepType.JUMP,
        label: values.label,
      });
    })();
  }

  return (
    <>
      <TextInput
        {...form.getInputProps("label")}
        key={form.key("label")}
        label="Label"
        maxLength={SCENE_LABEL_MAX_LENGTH}
      />
      <Button onClick={handleConfirm} className="mt-4">
        Confirm
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

  function handleAddStepClick(): void {
    setStepType(null);
    setDialogOpen(true);
  }

  function handleAddStepDialogClose(): void {
    setDialogOpen(false);
    setStepType(null);
  }

  function handleStepTypeSelect(type: SceneStepType): void {
    setStepType(type);
  }

  function handleStepConfirm(step: SceneStep): void {
    props.onChange({ ...props.scene, steps: [...props.scene.steps, step] });
    setDialogOpen(false);
  }

  return (
    <div>
      <div className="text-sm font-medium mb-2">Scene</div>
      <div className="flex gap-4">
        <Button onClick={handleAddStepClick}>Add step</Button>
        <Button>Move up</Button>
        <Button>Move down</Button>
      </div>

      <Modal
        opened={dialogOpen}
        onClose={handleAddStepDialogClose}
        title={stepType ? stepType : "Add step"}
      >
        {stepType === null ? (
          <SimpleGrid cols={3}>
            {Object.values(SceneStepType).map((stepType) => (
              <Button
                key={stepType}
                onClick={() => handleStepTypeSelect(stepType)}
              >
                {stepType}
              </Button>
            ))}
          </SimpleGrid>
        ) : stepType === SceneStepType.TEXT ? (
          <TextStep onConfirm={handleStepConfirm} />
        ) : stepType === SceneStepType.LABEL ? (
          <LabelStep onConfirm={handleStepConfirm} />
        ) : stepType === SceneStepType.JUMP ? (
          <JumpStep onConfirm={handleStepConfirm} />
        ) : null}
      </Modal>
    </div>
  );
}
