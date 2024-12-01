import { useAppStore } from "../store";
import { Anchor, AppShell, Burger, Group, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router";

export function MainLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  const account = useAppStore((state) => state.account);
  const character = useAppStore((state) => state.character);
  const sessionRestoreCompleted = useAppStore(
    (state) => state.sessionRestoreCompleted,
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Anchor
            onClick={() => navigate("/")}
            variant="gradient"
            gradient={{ from: "pink", to: "yellow" }}
            fw={500}
            fz="xl"
          >
            Bondage Fantasy
          </Anchor>
          {sessionRestoreCompleted && (
            <div className="ml-auto">
              {account && (
                <>
                  <span>{account.username}</span>
                  {character && (
                    <>
                      <span className="mx-2">/</span>
                      <span>{character.name}</span>
                    </>
                  )}
                </>
              )}
              {!account && (
                <div className="flex gap-1">
                  <Anchor onClick={() => navigate("/login")}>
                    {t("common.login")}
                  </Anchor>
                  <span>{t("common.or")}</span>
                  <Anchor onClick={() => navigate("/register")}>
                    {t("common.createNewAccount")}
                  </Anchor>
                </div>
              )}
            </div>
          )}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {account && (
          <NavLink
            onClick={() => navigate("/characters")}
            label={t("navbar.characters")}
          />
        )}
        {character && (
          <NavLink
            onClick={() => navigate("/zones")}
            label={t("navbar.zones")}
          />
        )}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
