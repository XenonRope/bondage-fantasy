import { Card } from "@mantine/core";
import { Npc } from "bondage-fantasy-common";

export function NpcCard(props: { npc: Npc }) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="cursor-pointer hover:bg-gray-100"
    >
      <span>{props.npc.name}</span>
    </Card>
  );
}
