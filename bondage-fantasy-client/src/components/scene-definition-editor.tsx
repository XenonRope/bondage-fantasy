import {
  faArrowDown,
  faArrowUp,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  Menu,
  Modal,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  SCENE_FRAME_TEXT_MAX_LENGTH,
  SCENE_LABEL_MAX_LENGTH,
  SceneDefinition,
  SceneStep,
  SceneStepType,
} from "bondage-fantasy-common";
import { useState } from "react";
import { Validators } from "../utils/validators";
import { TextTemplateEditor } from "./text-template-editor";

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
  }

  function handleStepTypeSelect(type: SceneStepType): void {
    setStepType(type);
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
                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="transparent">
                      <FontAwesomeIcon icon={faEllipsis} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => {}}>Edit</Menu.Item>
                    <Menu.Item onClick={() => handleRemoveStep(index)}>
                      Remove
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <Button onClick={handleAddStepClick}>Add step</Button>
        </div>
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
