import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Menu } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import {
  Character,
  ItemSlot,
  WearableItemOnCharacter,
} from "bondage-fantasy-common";
import { t } from "i18next";
import { Translation } from "react-i18next";
import { characterApi } from "../api/character-api";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { ImageWithPlaceholder } from "./image-with-placeholder";

function CharacterWearableSlot(props: {
  slot: ItemSlot;
  wearable?: WearableItemOnCharacter;
}) {
  const removeWearable = useMutation({
    mutationFn: async () => {
      const sessionData = await characterApi.removeWearable({
        slot: props.slot,
      });
      useAppStore.getState().updateSessionData(sessionData);
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });
  return (
    <div className="flex gap-2 items-center">
      <div className="h-11 w-11 flex-shrink-0">
        {props.wearable && (
          <ImageWithPlaceholder image={props.wearable.imageKey} />
        )}
        {!props.wearable && <div className="h-full border border-gray-300" />}
      </div>
      <div className="overflow-hidden flex-1 self-start">
        <div className="text-sm font-medium">
          <Translation>{(t) => t(`item.slots.${props.slot}`)}</Translation>
        </div>
        <div className="text-sm truncate">{props.wearable?.name}</div>
      </div>
      {props.wearable && (
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <ActionIcon variant="transparent" size="sm">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() =>
                !removeWearable.isPending && removeWearable.mutate()
              }
            >
              {t("common.removeWearable")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </div>
  );
}

export function CharacterWearables(props: { character: Character }) {
  return (
    <div className="flex flex-col gap-1">
      {Object.values(ItemSlot).map((slot) => (
        <CharacterWearableSlot
          key={slot}
          slot={slot}
          wearable={props.character.wearables.find((wearable) =>
            wearable.slots.includes(slot),
          )}
        />
      ))}
    </div>
  );
}
