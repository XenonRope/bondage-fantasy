import "./app.css";
import "./i18n";
import { MainLayout } from "./layouts/main-layout";
import AccountRegistrationPage from "./pages/account-registration-page";
import { CharacterCreationPage } from "./pages/character-creation-page";
import CharacterListPage from "./pages/character-list-page";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import { ZoneCreationPage } from "./pages/zone-creation-page";
import { ZoneListPage } from "./pages/zone-list-page";
import { errorService } from "./services/error-service";
import { sessionService } from "./services/session-service";
import alertClasses from "./theme/Alert.module.css";
import buttonClasses from "./theme/Button.module.css";
import { Alert, Button, createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";

sessionService.restoreSession();

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
    Button: Button.extend({
      classNames: buttonClasses,
    }),
    Alert: Alert.extend({
      classNames: alertClasses,
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
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<AccountRegistrationPage />} />
        <Route path="/characters" element={<CharacterListPage />} />
        <Route path="/new-character" element={<CharacterCreationPage />} />
        <Route path="/zones" element={<ZoneListPage />} />
      </Route>
      <Route
        path="/"
        element={<MainLayout key={"fixedHeight"} fixedHeight={true} />}
      >
        <Route path="/new-zone" element={<ZoneCreationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
