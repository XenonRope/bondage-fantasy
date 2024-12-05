import { characterService } from "../services/character-service";
import { useAppStore } from "../store";
import { Card } from "@mantine/core";
import { Character } from "bondage-fantasy-common";
import { useNavigate } from "react-router";

export function CharacterCard(props: { character: Character }) {
  const setCharacter = useAppStore((state) => state.setCharacter);
  const naviagate = useNavigate();

  function selectCharacter() {
    characterService.setDefaultCharacter(props.character.id);
    setCharacter(props.character);
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
