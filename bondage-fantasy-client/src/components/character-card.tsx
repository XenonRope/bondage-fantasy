import { Card } from "@mantine/core";
import { Character } from "bondage-fantasy-common";

export function CharacterCard(props: { character: Character }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <span>{props.character.name}</span>
    </Card>
  );
}
