import { characterService } from "../services/character-service";
import { Card } from "@mantine/core";
import { Character } from "bondage-fantasy-common";

export function CharacterCard(props: { character: Character }) {
  return (
    <Card
      onClick={() => characterService.selectCharacter(props.character.id)}
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
