import {
  Anchor,
  AppShell,
  Burger,
  Divider,
  Group,
  NavLink,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router";
import { CharacterWearables } from "../components/character-wearables";
import { LanguagePicker } from "../components/language-picker";
import { errorService } from "../services/error-service";
import { sessionService } from "../services/session-service";
import { useAppStore } from "../store";

export function MainLayout(props: { fixedHeight?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  const account = useAppStore((state) => state.account);
  const character = useAppStore((state) => state.character);
  const inZone = useAppStore((state) => state.zone != null);
  const inScene = useAppStore((state) => state.scene != null);
  const sessionRestoreCompleted = useAppStore(
    (state) => state.sessionInitialized,
  );
  const logout = useMutation({
    mutationFn: () => sessionService.logout(),
    onSuccess: () => {
      navigate("/login");
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={props.fixedHeight ? undefined : "md"}
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
            <div className="flex gap-4 items-center ml-auto">
              {account && (
                <span>
                  <span>{account.username}</span>
                  {character && (
                    <>
                      <span className="mx-2">/</span>
                      <span>{character.name}</span>
                    </>
                  )}
                  <Anchor
                    className="ml-4"
                    onClick={() => !logout.isPending && logout.mutate()}
                  >
                    {t("common.logOut")}
                  </Anchor>
                </span>
              )}
              {!account && (
                <div className="flex gap-2">
                  <Anchor onClick={() => navigate("/login")}>
                    {t("common.logIn")}
                  </Anchor>
                  <span>{t("common.or")}</span>
                  <Anchor onClick={() => navigate("/register")}>
                    {t("common.createNewAccount")}
                  </Anchor>
                </div>
              )}
              <LanguagePicker />
            </div>
          )}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {(inZone || inScene) && (
          <NavLink
            onClick={() => navigate("/explore")}
            label={t("navbar.explore")}
          />
        )}
        {character && (
          <>
            <NavLink
              onClick={() => navigate("/zones")}
              label={t("navbar.zones")}
            />
          </>
        )}
        {character && (
          <NavLink
            onClick={() => navigate("/inventory")}
            label={t("navbar.inventory")}
          />
        )}
        {character && (
          <NavLink
            onClick={() => navigate("/items")}
            label={t("navbar.crafting")}
          />
        )}
        {character && (
          <NavLink
            onClick={() => navigate("/images")}
            label={t("navbar.images")}
          />
        )}
        {account && (
          <NavLink
            onClick={() => navigate("/characters")}
            label={t("navbar.characters")}
          />
        )}
        {character && (
          <div>
            <Divider my="md" />
            <CharacterWearables character={character} />
          </div>
        )}
      </AppShell.Navbar>
      <AppShell.Main h={props.fixedHeight ? "100dvh" : undefined}>
        {props.fixedHeight ? (
          <div className="h-full overflow-auto">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </AppShell.Main>
    </AppShell>
  );
}
