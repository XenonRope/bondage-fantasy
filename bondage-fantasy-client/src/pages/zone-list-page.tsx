import { zoneApi } from "../api/zone-api";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Pagination,
  SimpleGrid,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ZONE_SEARCH_QUERY_MAX_LENGTH,
  ZONE_SEARCH_QUERY_MIN_LENGTH,
  ZoneJoinRequest,
} from "bondage-fantasy-common";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const PAGE_SIZE = 24;

export function ZoneListPage() {
  const uniqueId = useId();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inZone = useAppStore((state) => state.zone != null);
  const characterId = useAppStore((state) => state.character?.id);
  const [filter, setFilter] = useState({
    query: "",
    page: 1,
  });
  const searchResult = useQuery({
    queryKey: ["zones", filter, characterId, uniqueId],
    queryFn: () =>
      zoneApi.search({
        query: filter.query,
        offset: (filter.page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    enabled: () => filter.query.length >= ZONE_SEARCH_QUERY_MIN_LENGTH,
  });
  const join = useMutation({
    mutationFn: async (request: ZoneJoinRequest) => {
      const sessionDate = await zoneApi.join(request);
      useAppStore.getState().updateSessionData(sessionDate);
      navigate("/explore");
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  return (
    <div>
      <div>
        <div className="flex items-end">
          <TextInput
            label={t("common.search")}
            className="w-80"
            maxLength={ZONE_SEARCH_QUERY_MAX_LENGTH}
            onChange={(event) =>
              setFilter({ query: event.currentTarget.value, page: 1 })
            }
          />
          <Button
            className="shrink-0 ml-4"
            onClick={() => navigate("/new-zone")}
          >
            {t("common.createNewZone")}
          </Button>
        </div>
      </div>
      <div className="mt-8">
        <SimpleGrid cols={3}>
          {searchResult.data?.zones.map((zone) => (
            <Card
              key={zone.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-32"
            >
              <div className="flex justify-between items-center">
                <span>
                  <span className="font-medium">{zone.name}</span>
                  {zone.draft && (
                    <Badge size="sm" className="ml-2">
                      {t("common.draft")}
                    </Badge>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {zone.ownerCharacterId === characterId && (
                    <Tooltip
                      label={t("zoneList.edit")}
                      openDelay={500}
                      transitionProps={{ duration: 300 }}
                    >
                      <ActionIcon
                        variant="transparent"
                        size="sm"
                        onClick={() => navigate(`/zone/${zone.id}/edit`)}
                      >
                        <FontAwesomeIcon icon={faGear} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Button
                    size="compact-sm"
                    radius="xl"
                    disabled={inZone || zone.draft}
                    onClick={() =>
                      !join.isPending && join.mutate({ zoneId: zone.id })
                    }
                  >
                    {t("zoneList.join")}
                  </Button>
                </div>
              </div>
              <Text size="sm" c="dimmed" className="mt-2">
                {zone.description}
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
