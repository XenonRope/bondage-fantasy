import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  Card,
  Pagination,
  SimpleGrid,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  ITEM_SEARCH_QUERY_MAX_LENGTH,
  ITEM_SEARCH_QUERY_MIN_LENGTH,
} from "bondage-fantasy-common";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { itemApi } from "../api/item-api";

const PAGE_SIZE = 24;

export function ItemListPage() {
  const uniqueId = useId();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    query: "",
    page: 1,
  });
  const searchResult = useQuery({
    queryKey: ["items", filter, uniqueId],
    queryFn: () =>
      itemApi.search({
        query: filter.query,
        offset: (filter.page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    enabled: () => filter.query.length >= ITEM_SEARCH_QUERY_MIN_LENGTH,
  });

  return (
    <div>
      <div>
        <div className="flex items-end">
          <TextInput
            label={t("common.search")}
            className="w-80"
            maxLength={ITEM_SEARCH_QUERY_MAX_LENGTH}
            onChange={(event) =>
              setFilter({ query: event.currentTarget.value, page: 1 })
            }
          />
          <Button
            className="shrink-0 ml-4"
            onClick={() => navigate("/new-item")}
          >
            {t("item.createNewItem")}
          </Button>
        </div>
      </div>
      <div className="mt-8">
        <SimpleGrid cols={3}>
          {searchResult.data?.items.map((item) => (
            <Card
              key={item.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-32"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Tooltip
                    label={t("common.edit")}
                    openDelay={500}
                    transitionProps={{ duration: 300 }}
                  >
                    <ActionIcon
                      variant="transparent"
                      size="sm"
                      onClick={() => navigate(`/items/${item.id}/edit`)}
                    >
                      <FontAwesomeIcon icon={faGear} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              </div>
              <Text size="sm" c="dimmed" className="mt-2">
                {item.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </div>
      <div className="flex flex-col items-center mt-8">
        {searchResult.data && (
          <Pagination
            value={filter.page}
            onChange={(page) => setFilter((filter) => ({ ...filter, page }))}
            total={Math.ceil(searchResult.data.total / PAGE_SIZE)}
          />
        )}
      </div>
    </div>
  );
}
