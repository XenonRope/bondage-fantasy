import { zoneApi } from "../api/zone-api";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { Button, Card, SimpleGrid, Text, TextInput } from "@mantine/core";
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
