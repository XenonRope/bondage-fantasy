import { zoneApi } from "../api/zone-api";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  Card,
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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export function ZoneListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inZone = useAppStore((state) => state.zone != null);
  const [query, setQuery] = useState("");
  const searchResult = useQuery({
    queryKey: ["zones", query],
    queryFn: () => zoneApi.search({ query, offset: 0, limit: 24 }),
    enabled: () => query.length >= ZONE_SEARCH_QUERY_MIN_LENGTH,
  });
  const join = useMutation({
    mutationFn: async (request: ZoneJoinRequest) => {
      const sessionDate = await zoneApi.join(request);
      useAppStore.getState().updateSessionData(sessionDate);
      navigate("/explore");
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });
  const characterId = useAppStore((state) => state.character?.id);

  return (
    <div>
      <div>
        <div className="flex items-end">
          <TextInput
            label={t("common.search")}
            className="w-80"
            maxLength={ZONE_SEARCH_QUERY_MAX_LENGTH}
            onChange={(event) => setQuery(event.currentTarget.value)}
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
                <span className="font-medium">{zone.name}</span>
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
                    disabled={inZone}
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
    </div>
  );
}
