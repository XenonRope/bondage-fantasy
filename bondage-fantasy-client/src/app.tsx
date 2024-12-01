import "./app.css";
import "./i18n";
import AccountRegistrationPage from "./pages/account-registration-page";
import { CharacterCreationPage } from "./pages/character-creation-page";
import CharacterListPage from "./pages/character-list-page";
import HomePage from "./pages/home-page";
import { errorService } from "./services/error-service";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        <AppRouter />
      </MantineProvider>
    </QueryClientProvider>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/accounts/create" element={<AccountRegistrationPage />} />
        <Route path="/characters" element={<CharacterListPage />} />
        <Route path="/characters/create" element={<CharacterCreationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
