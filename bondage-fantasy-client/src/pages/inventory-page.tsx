import { Badge, Pagination, SimpleGrid, Text, TextInput } from "@mantine/core";
import { ITEM_SEARCH_QUERY_MAX_LENGTH } from "bondage-fantasy-common";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CardWithImage } from "../components/card-with-image";
import { NameWithId } from "../components/name-with-id";
import { useAppStore } from "../store";

const PAGE_SIZE = 24;

export function InventoryPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState({
    query: "",
    page: 1,
  });
  const character = useAppStore((state) => state.character);
  const items = useMemo(() => {
    return (character?.inventory || [])
      .filter((item) =>
        item.name.toLowerCase().includes(filter.query.toLowerCase()),
      )
      .slice((filter.page - 1) * PAGE_SIZE, filter.page * PAGE_SIZE);
  }, [character, filter.query, filter.page]);

  return (
    <div>
      <div>
        <div className="flex items-end">
          <TextInput
            label={t("common.search")}
            className="w-80"
            maxLength={ITEM_SEARCH_QUERY_MAX_LENGTH}
            onChange={(event) =>
              setFilter((filter) => ({
                ...filter,
                query: event.target.value,
                page: 1,
              }))
            }
          />
        </div>
      </div>
      <div className="mt-8">
        <SimpleGrid cols={3}>
          {items.map((item) => (
            <CardWithImage key={item.itemId}>
              <div className="flex justify-between items-start">
                <NameWithId name={item.name} id={item.itemId} />
                <Badge variant="default" size="lg" className="normal-case">
                  {"x" + item.count}
                </Badge>
              </div>
              <Text size="sm" c="dimmed" className="mt-2">
                {item.description}
              </Text>
            </CardWithImage>
          ))}
        </SimpleGrid>
      </div>
      <div className="flex flex-col items-center mt-8">
        <Pagination
          value={filter.page}
          onChange={(page) => setFilter((filter) => ({ ...filter, page }))}
          total={Math.ceil((character?.inventory.length ?? 0) / PAGE_SIZE)}
        />
      </div>
    </div>
  );
}
