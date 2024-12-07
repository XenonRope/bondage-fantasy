import { zoneApi } from "../api/zone-api";
import { errorService } from "../services/error-service";
import { Button, Card, SimpleGrid, Text, TextInput } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ZONE_SEARCH_QUERY_MAX_LENGTH,
  ZONE_SEARCH_QUERY_MIN_LENGTH,
  ZoneJoinRequest,
} from "bondage-fantasy-common";
import { useState } from "react";
import { Trans } from "react-i18next";
import { useNavigate } from "react-router";

export function ZoneListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const searchResult = useQuery({
    queryKey: ["zones", query],
    queryFn: () => zoneApi.search({ query, offset: 0, limit: 24 }),
    enabled: () => query.length >= ZONE_SEARCH_QUERY_MIN_LENGTH,
  });
  const join = useMutation({
    mutationFn: (request: ZoneJoinRequest) => zoneApi.join(request),
    onSuccess: () => {
      navigate("/");
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  return (
    <div>
      <div>
        <div className="flex items-end">
          <TextInput
            label={<Trans i18nKey="common.search" />}
            className="w-80"
            maxLength={ZONE_SEARCH_QUERY_MAX_LENGTH}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <Button
            className="shrink-0 ml-4"
            onClick={() => navigate("/new-zone")}
          >
            <Trans i18nKey="common.createNewZone" />
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
                  onClick={() =>
                    !join.isPending && join.mutate({ zoneId: zone.id })
                  }
                >
                  <Trans i18nKey="zoneList.join" />
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
