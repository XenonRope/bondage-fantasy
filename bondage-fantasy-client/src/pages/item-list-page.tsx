import {
  faEllipsisVertical,
  faGear,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  Menu,
  Pagination,
  SimpleGrid,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import {
  ITEM_SEARCH_QUERY_MAX_LENGTH,
  ItemSearchResponseRow,
  ItemType,
} from "bondage-fantasy-common";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { itemApi } from "../api/item-api";
import { CardWithImage } from "../components/card-with-image";
import { NameWithId } from "../components/name-with-id";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { useItemsQuery } from "../utils/item-utils";
import {
  DEFAULT_DEBOUNCE,
  DEFAULT_TOOLTIP_DELAY,
  DEFAULT_TOOLTIP_TRANSITION_DURATION,
} from "../utils/utils";

const PAGE_SIZE = 24;

function ItemActions(props: { item: ItemSearchResponseRow }) {
  const { t } = useTranslation();
  const wear = useMutation({
    mutationFn: async () => {
      const sessionData = await itemApi.wear({ itemId: props.item.id });
      useAppStore.getState().updateSessionData(sessionData);
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  return (
    <Menu position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon variant="transparent" size="sm">
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </ActionIcon>
      </Menu.Target>
      {props.item.type === ItemType.WEARABLE && (
        <Menu.Dropdown>
          <Menu.Item onClick={() => !wear.isPending && wear.mutate()}>
            {t("item.wear")}
          </Menu.Item>
        </Menu.Dropdown>
      )}
    </Menu>
  );
}

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
    { ...filter, pageSize: PAGE_SIZE, includeShared: true },
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
              <div className="flex justify-between items-start min-w-0">
                <div className="min-w-0 flex items-center gap-2">
                  <NameWithId name={item.name} id={item.id} />
                  {item.shared && (
                    <Tooltip
                      label={t("item.shared")}
                      openDelay={DEFAULT_TOOLTIP_DELAY}
                      transitionProps={{
                        duration: DEFAULT_TOOLTIP_TRANSITION_DURATION,
                      }}
                    >
                      <FontAwesomeIcon icon={faGlobe} />
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!item.shared && (
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
                  )}
                  <ItemActions item={item} />
                </div>
              </div>
              <Text size="sm" c="dimmed" className="mt-2 line-clamp-3">
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
