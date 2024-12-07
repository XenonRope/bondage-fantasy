import { zoneApi } from "../api/zone-api";
import { characterService } from "../services/character-service";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { isErrorResponseWithCode } from "../utils/error";
import { Card } from "@mantine/core";
import { Character, ErrorCode } from "bondage-fantasy-common";
import { useNavigate } from "react-router";

export function CharacterCard(props: { character: Character }) {
  const account = useAppStore((state) => state.account);
  const naviagate = useNavigate();

  async function selectCharacter() {
    if (account) {
      characterService.setDefaultCharacterForAccount(
        props.character.id,
        account.id,
      );
    }
    useAppStore.getState().setCharacter(props.character);
    try {
      const zone = await zoneApi.getVision();
      useAppStore.getState().setZone(zone);
    } catch (error) {
      if (isErrorResponseWithCode(error, ErrorCode.E_CHARACTER_NOT_IN_ZONE)) {
        useAppStore.getState().setZone(undefined);
      } else {
        errorService.handleUnexpectedError(error);
      }
    }
    naviagate("/zones");
  }

  return (
    <Card
      onClick={selectCharacter}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="cursor-pointer hover:bg-gray-100"
    >
      <span>{props.character.name}</span>
    </Card>
  );
}
