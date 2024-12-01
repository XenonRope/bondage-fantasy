import { Button } from "@mantine/core";
import { Trans } from "react-i18next";
import { useNavigate } from "react-router";

export function ZoneListPage() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate("/new-zone")}>
      <Trans i18nKey="common.createNewZone" />
    </Button>
  );
}
