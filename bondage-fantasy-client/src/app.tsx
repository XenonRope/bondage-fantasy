import {
  ActionIcon,
  Alert,
  Button,
  createTheme,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import { sessionApi } from "./api/session-api";
import "./app.css";
import "./i18n";
import { MainLayout } from "./layouts/main-layout";
import AccountRegistrationPage from "./pages/account-registration-page";
import { CharacterCreationPage } from "./pages/character-creation-page";
import CharacterListPage from "./pages/character-list-page";
import { ExplorePage } from "./pages/explore-page";
import HomePage from "./pages/home-page";
import { ItemEditorPage } from "./pages/item-editor-page";
import { ItemListPage } from "./pages/item-list-page";
import LoginPage from "./pages/login-page";
import { ZoneEditorPage } from "./pages/zone-editor-page";
import { ZoneListPage } from "./pages/zone-list-page";
import { characterService } from "./services/character-service";
import { errorService } from "./services/error-service";
import { useAppStore } from "./store";
import actionIconClasses from "./theme/ActionIcon.module.css";
import alertClasses from "./theme/Alert.module.css";
import buttonClasses from "./theme/Button.module.css";
import { AuthRequired } from "./utils/auth-required";
import { CharacterRequired } from "./utils/character-required";
import { ZoneOrSceneRequired } from "./utils/zone-required";
import { InventoryPage } from "./pages/inventory-page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      onError: (error) => errorService.handleUnexpectedError(error),
    },
  },
  queryCache: new QueryCache({
    onError: (error) => errorService.handleUnexpectedError(error),
  }),
});

const theme = createTheme({
  components: {
    ActionIcon: ActionIcon.extend({
      classNames: actionIconClasses,
    }),
    Alert: Alert.extend({
      classNames: alertClasses,
    }),
    Button: Button.extend({
      classNames: buttonClasses,
    }),
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

function AppRouter() {
  const navigate = useNavigate();
  useEffect(() => {
    useAppStore.getState().initialize({ navigate });
  }, [navigate]);
  const sessionData = useQuery({
    queryKey: ["sessionData"],
    queryFn: async () => {
      const characterId =
        useAppStore.getState().character?.id ??
        characterService.getDefaultCharacter();
      return await sessionApi.getSessionData({
        characterId,
      });
    },
    gcTime: 0,
  });
  useEffect(() => {
    if (sessionData.data) {
      useAppStore.getState().updateSessionData(sessionData.data);
    }
  }, [sessionData.data]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<AccountRegistrationPage />} />
        <Route element={<AuthRequired />}>
          <Route path="/characters" element={<CharacterListPage />} />
          <Route path="/new-character" element={<CharacterCreationPage />} />
          <Route element={<CharacterRequired />}>
            <Route path="/zones" element={<ZoneListPage />} />
            <Route path="/items" element={<ItemListPage />} />
            <Route path="/new-item" element={<ItemEditorPage />} />
            <Route path="/items/:itemId/edit" element={<ItemEditorPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
          </Route>
        </Route>
      </Route>
      <Route
        path="/"
        element={<MainLayout key={"fixedHeight"} fixedHeight={true} />}
      >
        <Route element={<AuthRequired />}>
          <Route element={<CharacterRequired />}>
            <Route path="/new-zone" element={<ZoneEditorPage />} />
            <Route path="/zones/:zoneId/edit" element={<ZoneEditorPage />} />
            <Route element={<ZoneOrSceneRequired />}>
              <Route path="/explore" element={<ExplorePage />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
