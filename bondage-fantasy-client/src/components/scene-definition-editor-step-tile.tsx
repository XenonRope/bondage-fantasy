import {
  faArrowDown,
  faArrowUp,
  faGear,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon } from "@mantine/core";
import {
  SceneStep,
  SceneStepChangeItemsCount,
  SceneStepType,
} from "bondage-fantasy-common";
import { t } from "i18next";

export function SceneDefinitionEditorStepTile(props: {
  step: SceneStep;
  items: Array<{
    id: number;
    name: string;
  }>;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex justify-between items-start p-2 border border-black">
      <div>
        {props.step.type === SceneStepType.TEXT && (
          <div className="line-clamp-2">
            {props.step.characterName && (
              <span>{props.step.characterName}:&nbsp;</span>
            )}
            <span>{props.step.text}</span>
          </div>
        )}
        {props.step.type === SceneStepType.LABEL && (
          <>
            <span className="font-medium">Label&nbsp;</span>
            <span>{props.step.label}</span>
          </>
        )}
        {props.step.type === SceneStepType.JUMP && (
          <>
            <span className="font-medium">Jump to&nbsp;</span>
            <span>{props.step.label}</span>
            {props.step.condition && (
              <>
                <span className="font-medium">&nbsp;if&nbsp;</span>
                <span>{props.step.condition}</span>
              </>
            )}
          </>
        )}
        {props.step.type === SceneStepType.VARIABLE && (
          <>
            <span className="font-medium">Set&nbsp;</span>
            <span>{props.step.name}</span>
            <span className="font-medium">&nbsp;to&nbsp;</span>
            <span>{props.step.value}</span>
          </>
        )}
        {props.step.type === SceneStepType.CHOICE && (
          <div>
            <div className="font-medium">Choice&nbsp;</div>
            {props.step.options.map((option) => (
              <div key={option.name}>
                <span>{option.name}</span>
                {option.condition && (
                  <>
                    <span className="font-medium">&nbsp;if&nbsp;</span>
                    <span>{option.condition}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {props.step.type === SceneStepType.USE_WEARABLE && (
          <>
            <div>
              <span className="font-medium">Use&nbsp;</span>
              <span>
                {props.step.itemsIds
                  .map(
                    (id) =>
                      (props.items.find((item) => item.id === id)?.name ?? "") +
                      ` (${id})`,
                  )
                  .join(", ")}
              </span>
            </div>
            {props.step.fallbackLabel && (
              <>
                <span className="font-medium">Fallback&nbsp;</span>
                <span>{props.step.fallbackLabel}</span>
              </>
            )}
          </>
        )}
        {props.step.type === SceneStepType.REMOVE_WEARABLE && (
          <>
            <div>
              <span className="font-medium">Remove from&nbsp;</span>
              <span>
                {props.step.slots
                  .map((slot) => t(`item.slots.${slot}`))
                  .join(", ")}
              </span>
            </div>
            {props.step.fallbackLabel && (
              <>
                <span className="font-medium">Fallback&nbsp;</span>
                <span>{props.step.fallbackLabel}</span>
              </>
            )}
          </>
        )}
        {props.step.type === SceneStepType.CHANGE_ITEMS_COUNT && (
          <>
            <span className="font-medium">Change count of&nbsp;</span>
            <span>
              {(props.items.find(
                (item) =>
                  item.id === (props.step as SceneStepChangeItemsCount).itemId,
              )?.name ?? "") + ` (${props.step.itemId})`}
            </span>
            <span className="font-medium">&nbsp;by&nbsp;</span>
            <span>{props.step.delta}</span>
          </>
        )}
        {props.step.type === SceneStepType.ABORT && (
          <span className="font-medium">Abort</span>
        )}
      </div>
      <div className="flex items-center ml-auto">
        <ActionIcon
          variant="transparent"
          onClick={props.onMoveUp}
          disabled={!props.onMoveUp}
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </ActionIcon>
        <ActionIcon
          variant="transparent"
          onClick={props.onMoveDown}
          disabled={!props.onMoveDown}
        >
          <FontAwesomeIcon icon={faArrowDown} />
        </ActionIcon>
        <ActionIcon
          variant="transparent"
          onClick={props.onEdit}
          disabled={props.step.type === SceneStepType.ABORT}
        >
          <FontAwesomeIcon icon={faGear} />
        </ActionIcon>
        <ActionIcon
          variant="transparent"
          data-variant-color="danger"
          onClick={props.onRemove}
        >
          <FontAwesomeIcon icon={faTrash} />
        </ActionIcon>
      </div>
    </div>
  );
}
