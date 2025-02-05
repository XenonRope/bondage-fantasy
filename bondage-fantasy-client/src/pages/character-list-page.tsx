import { characterApi } from "../api/character-api";
import { CharacterCard } from "../components/character-card";
import { Button, SimpleGrid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function CharacterListPage() {
  const { t } = useTranslation();
  const naviage = useNavigate();
  const characters = useQuery({
    queryKey: ["characters"],
    queryFn: () => characterApi.list(),
  });

  return (
    <div>
      <Button onClick={() => naviage("/new-character")}>
        {t("characterList.createNewCharacter")}
      </Button>
      <SimpleGrid className="mt-4" cols={3}>
        {characters.data?.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </SimpleGrid>
    </div>
  );
}
