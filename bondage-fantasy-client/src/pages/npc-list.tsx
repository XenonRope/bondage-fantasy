import { npcApi } from "../api/npc-api";
import { NpcCard } from "../components/npc-card";
import { useAppStore } from "../store";
import { Button, SimpleGrid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { NPC_MAX_COUNT } from "bondage-fantasy-common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function NpcListPage() {
  const characterId = useAppStore((state) => state.character?.id);
  const { t } = useTranslation();
  const naviage = useNavigate();
  const npcList = useQuery({
    queryKey: ["npcList", characterId],
    queryFn: () => npcApi.list(),
  });

  return (
    <div>
      <Button
        disabled={npcList.data && npcList.data.length >= NPC_MAX_COUNT}
        onClick={() => naviage("/new-npc")}
      >
        {t("npcList.createNewNpc")}
      </Button>
      <SimpleGrid className="mt-4" cols={5}>
        {npcList.data?.map((npc) => <NpcCard key={npc.id} npc={npc} />)}
      </SimpleGrid>
    </div>
  );
}
