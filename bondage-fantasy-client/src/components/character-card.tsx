import { Card } from "@mantine/core";
import { Character } from "bondage-fantasy-common";
import { characterService } from "../services/character-service";
import { NameWithId } from "./name-with-id";

export function CharacterCard(props: { character: Character }) {
  return (
    <Card
      onClick={() => characterService.selectCharacter(props.character.id)}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="cursor-pointer hover:bg-gray-100 h-32"
    >
      <NameWithId name={props.character.name} id={props.character.id} />
    </Card>
  );
}
