import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  Pagination,
  SimpleGrid,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { ITEM_SEARCH_QUERY_MAX_LENGTH } from "bondage-fantasy-common";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { CardWithImage } from "../components/card-with-image";
import { NameWithId } from "../components/name-with-id";
import { useItemsQuery } from "../utils/item-utils";
import {
  DEFAULT_DEBOUNCE,
  DEFAULT_TOOLTIP_DELAY,
  DEFAULT_TOOLTIP_TRANSITION_DURATION,
} from "../utils/utils";

const PAGE_SIZE = 24;

export function ItemListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    query: "",
    page: 1,
  });
  const setQuery = useDebouncedCallback((query: string) => {
    setFilter((filter) => ({ ...filter, query, page: 1 }));
  }, DEFAULT_DEBOUNCE);
  const searchResult = useItemsQuery(
    { ...filter, pageSize: PAGE_SIZE },
    { keepPreviousData: true },
  );

  return (
    <div>
      <div>
        <div className="flex items-end">
          <TextInput
            label={t("common.search")}
            className="w-80"
            maxLength={ITEM_SEARCH_QUERY_MAX_LENGTH}
            onChange={(event) => setQuery(event.currentTarget.value)}
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
            <CardWithImage key={item.id} image={item.imageKey}>
              <div className="flex justify-between items-center">
                <NameWithId name={item.name} id={item.id} />
                <div className="flex items-center gap-2">
                  <Tooltip
                    label={t("common.edit")}
                    openDelay={DEFAULT_TOOLTIP_DELAY}
                    transitionProps={{
                      duration: DEFAULT_TOOLTIP_TRANSITION_DURATION,
                    }}
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
            </CardWithImage>
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
