import { sessionApi } from "../api/session-api";
import { characterService } from "../services/character-service";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { Card } from "@mantine/core";
import { Character } from "bondage-fantasy-common";
import { useNavigate } from "react-router";

export function CharacterCard(props: { character: Character }) {
  const naviagate = useNavigate();

  async function selectCharacter() {
    try {
      const sessionData = await sessionApi.getSessionData({
        characterId: props.character.id,
      });
      useAppStore.getState().updateSessionData(sessionData);
      characterService.setDefaultCharacter(props.character.id);
      if (sessionData.zone) {
        naviagate("/explore");
      } else {
        naviagate("/zones");
      }
    } catch (error) {
      errorService.handleUnexpectedError(error);
    }
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
