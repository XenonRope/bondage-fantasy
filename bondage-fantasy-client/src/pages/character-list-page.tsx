import { characterApi } from "../api/character-api";
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
      <Button onClick={() => naviage("/characters/create")}>
        {t("characterList.createNewCharacter")}
      </Button>
      <SimpleGrid>
        {characters.data?.map((character) => (
          <div key={character.id}>{character.name}</div>
        ))}
      </SimpleGrid>
    </div>
  );
}
