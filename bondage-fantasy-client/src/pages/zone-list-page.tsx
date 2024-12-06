import { zoneApi } from "../api/zone-api";
import { Button, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  ZONE_SEARCH_QUERY_MAX_LENGTH,
  ZONE_SEARCH_QUERY_MIN_LENGTH,
} from "bondage-fantasy-common";
import { useState } from "react";
import { Trans } from "react-i18next";
import { useNavigate } from "react-router";

export function ZoneListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const searchResult = useQuery({
    queryKey: ["zones", query],
    queryFn: () => zoneApi.search({ query, offset: 0, limit: 10 }),
    enabled: () => query.length >= ZONE_SEARCH_QUERY_MIN_LENGTH,
  });

  return (
    <div>
      <div>
        <Button onClick={() => navigate("/new-zone")}>
          <Trans i18nKey="common.createNewZone" />
        </Button>
        <TextInput
          maxLength={ZONE_SEARCH_QUERY_MAX_LENGTH}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </div>
      <div>
        {searchResult.data?.zones.map((zone) => (
          <div key={zone.id}>{zone.name}</div>
        ))}
      </div>
    </div>
  );
}
